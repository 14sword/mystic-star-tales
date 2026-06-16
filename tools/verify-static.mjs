import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readText('index.html');
const manifest = JSON.parse(readText('manifest.json'));
const assetManifest = JSON.parse(readText('assets/generated/asset-manifest.json'));
const sw = readText('sw.js');
const failures = [];

function readText(path) {
    return readFileSync(join(root, path), 'utf8');
}

function assetPath(path) {
    return normalize(path.replace(/[?#].*$/, '').replace(/^\.?\//, ''));
}

function hasExtension(path, extension) {
    return assetPath(path).endsWith(extension);
}

function checkExists(path, label = path) {
    const fullPath = join(root, assetPath(path));
    if (!existsSync(fullPath)) {
        failures.push(`Missing ${label}: ${path}`);
        return null;
    }
    return fullPath;
}

function checkNonEmpty(path, label = path) {
    const fullPath = checkExists(path, label);
    if (fullPath && statSync(fullPath).size === 0) {
        failures.push(`Empty ${label}: ${path}`);
    }
}

const htmlRefs = [
    ...indexHtml.matchAll(/\b(?:src|href|content)=["']([^"'\s?#]+\.(?:js|css|png|jpg|jpeg|webp|json))(?:\?[^"']*)?["']/gi)
].map((match) => match[1])
    .filter((path) => !path.startsWith('http') && !path.startsWith('data:'));

for (const ref of htmlRefs) {
    checkExists(ref, 'HTML reference');
    if (/\.(png|jpg|jpeg|webp)$/i.test(assetPath(ref))) {
        checkNonEmpty(ref, 'HTML image');
    }
}

for (const icon of manifest.icons || []) {
    checkNonEmpty(icon.src, 'manifest icon');
}

if ((assetManifest.intros || []).length !== 10) {
    failures.push(`Expected 10 AI story intros, found ${(assetManifest.intros || []).length}`);
}

for (const intro of assetManifest.intros || []) {
    if (!intro.storyId) {
        failures.push('AI intro is missing storyId');
    }
    checkNonEmpty(intro.poster, `AI intro poster for ${intro.storyId}`);
    checkNonEmpty(intro.thumb, `AI intro thumb for ${intro.storyId}`);

    if (!Array.isArray(intro.frames)) {
        failures.push(`AI intro for ${intro.storyId} frames must be an array`);
    } else {
        for (const frame of intro.frames) {
            checkNonEmpty(frame, `AI intro frame for ${intro.storyId}`);
        }
    }
}

for (const asset of assetManifest.assets || []) {
    if (asset.offline && asset.src && /\.(png|jpg|jpeg|webp|json)$/i.test(asset.src)) {
        checkNonEmpty(asset.src, `AI asset manifest entry for ${asset.storyId || 'unknown'}`);
    }
}

const swAssetsMatch = sw.match(/const ASSETS_TO_CACHE = \[([\s\S]*?)\];/);
const swAssets = swAssetsMatch
    ? [...swAssetsMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1])
    : [];

if (!swAssets.length) {
    failures.push('Service worker ASSETS_TO_CACHE list was not found');
}

for (const asset of swAssets.filter((path) => path !== '.')) {
    checkExists(asset, 'service worker asset');
}

for (const script of htmlRefs.filter((path) => hasExtension(path, '.js'))) {
    if (!swAssets.includes(assetPath(script))) {
        failures.push(`HTML script is not pre-cached by service worker: ${script}`);
    }
}

for (const script of swAssets.filter((path) => path.endsWith('.js'))) {
    execFileSync(process.execPath, ['--check', join(root, script)], { stdio: 'pipe' });
}

if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
}

console.log(JSON.stringify({
    htmlRefs: htmlRefs.length,
    swAssets: swAssets.length,
    checkedScripts: swAssets.filter((path) => path.endsWith('.js')).length,
    status: 'ok'
}, null, 2));
