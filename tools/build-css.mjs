import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const FILES_TO_BUNDLE = [
    'css/reset.css',
    'css/variables.css',
    'css/background.css',
    'css/cards.css',
    'css/modal.css',
    'css/main.css',
    'css/clean-ui.css'
];

function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around symbols
        .replace(/\s*([{};:,])\s*/g, '$1')
        // Remove trailing semicolons in blocks
        .replace(/;}/g, '}')
        // Trim leading and trailing spaces
        .trim();
}

async function build() {
    console.log('✦ Starting CSS bundling...');
    let combinedContent = `/* Mystic Star Tales - Combined & Minified Stylesheet */\n`;
    combinedContent += `/* Source components: ${FILES_TO_BUNDLE.map(f => f.replace('css/', '')).join(' + ')} */\n`;

    for (const file of FILES_TO_BUNDLE) {
        const filePath = join(root, file);
        try {
            console.log(`- Bundling: ${file}`);
            const content = readFileSync(filePath, 'utf8');
            combinedContent += `\n/* --- ${file} --- */\n` + minifyCSS(content);
        } catch (error) {
            console.error(`❌ Error reading ${file}:`, error.message);
            process.exit(1);
        }
    }

    const outputPath = join(root, 'css/styles.min.css');
    writeFileSync(outputPath, combinedContent, 'utf8');
    console.log(`\n✅ Successfully bundled and minified CSS to: css/styles.min.css`);
}

build().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
