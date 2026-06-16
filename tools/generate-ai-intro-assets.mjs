import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let sharp;

try {
    sharp = require('sharp');
} catch (error) {
    throw new Error('The asset generator needs sharp. Run with NODE_PATH pointing to the bundled Codex node_modules.');
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cardsData = require(join(root, 'js/cards-data.js'));
const outputRoot = join(root, 'assets/generated/story-intros');
const generatedAt = '2026-06-09T00:00:00.000Z';
const width = 900;
const height = 1125;

const introSpecs = {
    tiger: {
        caption: '月光穿过山林，守护神虎从雾中醒来。',
        tone: 'guardian',
        motion: 'drift',
        palette: ['#08131d', '#c8a44d', '#68c4c7'],
        prompt: 'Sacred Chinese zodiac tiger guardian in a moonlit ancient mountain forest, clean dark star-map atmosphere, mysterious fairy-tale picture-book cinematic frame.',
        frameCaptions: [
            '月光下的古老森林，守护神虎从迷雾中缓缓苏醒。',
            '妖魔在人间肆虐，百姓呼唤守护神的降临。',
            '神虎啸聚山林，散发神圣的金光与辟邪之力。',
            '星河轮转，白虎七宿守护秋收，神威万古长存。'
        ]
    },
    sagittarius: {
        caption: '弓弦拉满，智慧的星座导师守望人间。',
        tone: 'heroic',
        motion: 'rise',
        palette: ['#0a1222', '#d6b56a', '#8bc6d9'],
        prompt: 'Wise centaur archer Chiron beneath Greek constellations, noble and gentle, clean dark star-map atmosphere, high-quality picture-book cinematic frame.',
        frameCaptions: [
            '在古希腊的山谷中，睿智的半人马喀戎正指点着群星，传授凡人智慧。',
            '喀戎是众英雄的导师，教导阿喀琉斯与赫拉克勒斯勇气和慈悲的真谛。',
            '面对命运的残酷误伤，他自愿代替普罗米修斯承受痛苦，以换取人类的火种。',
            '宙斯感念其高尚的牺牲，将其升为射手座，永远拉满星光之弓守护希望。'
        ]
    },
    aurora: {
        caption: '极北的光带起舞，为归途点亮天空。',
        tone: 'ethereal',
        motion: 'veil',
        palette: ['#071523', '#72d6c9', '#b985ff'],
        prompt: 'Nordic aurora spirits dancing over a silent snowy horizon, green and violet light ribbons, mysterious fairy-tale cinematic illustration.',
        frameCaptions: [
            '在世界的尽头，火狐在无垠雪原上奔跑，尾巴扫起雪花化作夜空的火花。',
            '萨米人传说中，舞动的彩色光带是逝者灵魂在大气中起舞，向亲人报平安。',
            '光之精灵是奥丁神的侍女，她们用绿与紫的魔力交织出引导英雄的通道。',
            '这些曼妙的光芒在寒夜中闪烁，治愈着世人的心灵，唤醒对未知的敬畏。'
        ]
    },
    kalpavriksha: {
        caption: '如意神树在星海里开花，愿望随光落下。',
        tone: 'sacred',
        motion: 'bloom',
        palette: ['#081719', '#d9bd73', '#79c99a'],
        prompt: 'Mythic Kalpavriksha wish tree glowing with jewels and starlight, ancient Indian sacred atmosphere, refined picture-book cinematic frame.',
        frameCaptions: [
            '创世之初，众神与阿修罗搅拌乳海，如意神树从翻腾的浪花中缓缓升起。',
            '神树扎根于天界须弥山顶，银枝金根，绿翠为叶，珠宝为花。',
            '它拥有无边慈悲，能根据抚摸者的心愿结出智慧、宁静与平安的宝石果实。',
            '如意神树的图腾流传于古老殿堂，提醒着人们善意终将获得宇宙的回响。'
        ]
    },
    anubis: {
        caption: '真理之厅静默，心与羽毛等待审判。',
        tone: 'solemn',
        motion: 'weigh',
        palette: ['#090f18', '#d4b36f', '#5fa9c7'],
        prompt: 'Anubis in the Hall of Truth weighing a heart against a feather, ancient Egyptian myth, clean dark gold and teal cinematic storybook frame.',
        frameCaptions: [
            '在古老的尼罗河畔，胡狼首的阿努比斯静立于冥界入口，指引亡灵的归途。',
            '穿过重重险阻的灵魂来到真理之厅，在庄严的黄金天平前等待审判。',
            '阿努比斯亲手称量亡者的心脏，与玛特女神的真理羽毛进行衡定。',
            '唯有纯洁无罪的心灵能通过考验，在神明的微笑中走向永恒的奥西里斯乐园。'
        ]
    },
    amaterasu: {
        caption: '天岩户微启，第一缕光重新照见世界。',
        tone: 'radiant',
        motion: 'reveal',
        palette: ['#101018', '#e3b65e', '#f2dfaa'],
        prompt: 'Amaterasu emerging from the heavenly rock cave, warm sun rays returning to a dark world, Japanese myth, elegant cinematic picture-book frame.',
        frameCaptions: [
            '高天原的太阳女神天照将温暖照耀大地，却因弟弟须佐之男的暴行而悲伤隐退。',
            '女神躲入深邃的天岩户洞穴，天地瞬间陷入永恒的黑暗，妖魔随之肆虐。',
            '众神在洞外挂起神镜并欢歌起舞，好奇的天照轻轻推开岩石窥探外面的喧闹。',
            '镜中折射出她自身的光芒，天照重出洞穴，温暖的初晖再次普照世间。'
        ]
    },
    sidhe: {
        caption: '迷雾中的山丘轻响，异世界在月下呼吸。',
        tone: 'whisper',
        motion: 'mist',
        palette: ['#07131c', '#b7c77a', '#82c8bd'],
        prompt: 'Celtic fairy hill in Irish mist under moonlight, hidden doorway to the otherworld, clean mysterious fairy-tale cinematic illustration.',
        frameCaptions: [
            '在爱尔兰翠绿迷雾的丘陵间，神秘的绿色土丘在月光下闪烁着异界的光芒。',
            '精灵族“席德”在夜幕降临时走出洞府，在星空下翩翩起舞，歌声如天籁。',
            '凡人若被邀请参加宴会，将品尝不老的美酒，但人间的时间将悄然流逝百年。',
            '德鲁伊祭司在橡树林中聆听他们的低语，代代守护着人类与自然的神秘契约。'
        ]
    },
    quetzalcoatl: {
        caption: '翠羽划过黄昏，文明的种子落入大地。',
        tone: 'mythic',
        motion: 'serpent',
        palette: ['#07161c', '#d2aa53', '#49c8a7'],
        prompt: 'Feathered serpent Quetzalcoatl descending near a stepped temple at dusk, Mayan and Aztec myth, clean cinematic picture-book frame.',
        frameCaptions: [
            '创世之初，长满翠绿羽毛的神蛇库库尔坎从风暴与混沌中游弋降世。',
            '他用金黄的玉米捏造了人类的躯体，并将丰收的种子播撒到中美洲大地。',
            '羽蛇神传授历法、历书和冶金技术，带领人类告别蒙昧，走向文明。',
            '春分时节，夕阳在金字塔台阶上投下蛇形光影，神明承诺终将乘蛇筏重返人间。'
        ]
    },
    firebird: {
        caption: '一根燃烧的羽毛，照亮最长的冬夜。',
        tone: 'ember',
        motion: 'flare',
        palette: ['#130d12', '#ff9d3d', '#ffd27a'],
        prompt: 'Slavic firebird glowing in a magical orchard at night, golden apples and ember feathers, refined fairy-tale cinematic storybook frame.',
        frameCaptions: [
            '在东方魔法守护的果园里，火鸟在金苹果树间起舞，羽毛如火焰般燃烧。',
            '勇敢的伊万王子为救国家踏上艰险旅程，在幽暗的森林深处寻找神鸟。',
            '只有心怀无私善意的人才能通过考验，火鸟赠予他一根能照亮黑夜的羽毛。',
            '火鸟的羽毛带给世人希望与重生，驱散隆冬的严寒，迎来春回大地的生机。'
        ]
    },
    genie: {
        caption: '铜灯升起蓝烟，飞毯掠过星光沙海。',
        tone: 'wonder',
        motion: 'smoke',
        palette: ['#07111e', '#d9ad64', '#64c9d7'],
        prompt: 'Arabian magic lamp, blue smoke genie silhouette and flying carpet over a moonlit desert, clean starry cinematic picture-book frame.',
        frameCaptions: [
            '在古老的巴格达集市，一盏平平无奇的铜灯静静躺在角落，等待有缘人擦拭。',
            '伴随一缕蓝色烟雾升起，强大的灯神浮现于星空下，能实现三个惊人的愿望。',
            '神奇的织锦飞毯载着主人掠过广袤的沙海，在月光与绿洲之间自由穿梭。',
            '贪婪者被欲望吞噬，唯有纯洁的心灵能释放灯神，获得真正的自由与爱。'
        ]
    }
};

function svgOverlay(spec, frameIndex) {
    const [bg, accent, teal] = spec.palette;
    
    // 生成星空点阵
    const stars = Array.from({ length: 48 }, (_, index) => {
        const x = (index * 83 + frameIndex * 47) % width;
        const y = (index * 149 + frameIndex * 97) % height;
        const radius = index % 8 === 0 ? 2.2 : 1.15;
        const color = index % 3 === 0 ? accent : '#ffffff';
        const starOpacity = index % 4 === 0 ? 0.76 : 0.36;
        return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="${starOpacity}"/>`;
    }).join('');

    let specificContent = '';
    let radialGradientOpacity = 0.35;

    if (frameIndex === 0 || frameIndex === 1) {
        // 第1分镜：宁静觉醒，辅以古老同心天体仪线
        radialGradientOpacity = 0.45;
        specificContent = `
            <circle cx="${width / 2}" cy="${height / 2}" r="380" fill="none" stroke="${accent}" stroke-width="1" stroke-dasharray="4,8" opacity="0.16"/>
            <circle cx="${width / 2}" cy="${height / 2}" r="260" fill="none" stroke="${teal}" stroke-width="0.8" opacity="0.12"/>
        `;
    } else if (frameIndex === 2) {
        // 第2分镜：神话呼唤与冲突，斜向指引星芒光束
        radialGradientOpacity = 0.3;
        specificContent = `
            <defs>
                <linearGradient id="beam1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="${accent}" stop-opacity="0"/>
                    <stop offset="50%" stop-color="${accent}" stop-opacity="0.22"/>
                    <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <path d="M120 -50 L300 -50 L80 ${height + 50} L-100 ${height + 50} Z" fill="url(#beam1)"/>
            <path d="M${width - 120} -50 L${width - 300} -50 L${width - 80} ${height + 50} L${width + 100} ${height + 50} Z" fill="url(#beam1)" opacity="0.4"/>
        `;
    } else if (frameIndex === 3) {
        // 第3分镜：施展神威，同心刻度魔法阵列与放射十字
        radialGradientOpacity = 0.65;
        specificContent = `
            <circle cx="${width / 2}" cy="${height / 2}" r="330" fill="none" stroke="${accent}" stroke-width="1.8" opacity="0.25"/>
            <circle cx="${width / 2}" cy="${height / 2}" r="310" fill="none" stroke="${teal}" stroke-width="1" opacity="0.2"/>
            <circle cx="${width / 2}" cy="${height / 2}" r="290" fill="none" stroke="${accent}" stroke-width="0.8" stroke-dasharray="2,6" opacity="0.3"/>
            <path d="M ${width / 2} ${height / 2 - 340} L ${width / 2} ${height / 2 + 340} M ${width / 2 - 340} ${height / 2} L ${width / 2 + 340} ${height / 2}" stroke="${accent}" stroke-width="0.5" opacity="0.15"/>
        `;
    } else if (frameIndex === 4) {
        // 第4分镜：升华融入星盘，黄金星座几何连线图谱
        radialGradientOpacity = 0.4;
        specificContent = `
            <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${accent}"/>
                    <stop offset="100%" stop-color="${teal}"/>
                </linearGradient>
            </defs>
            <circle cx="${width / 2}" cy="${height / 2}" r="360" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.35"/>
            <circle cx="${width / 2}" cy="${height / 2}" r="340" fill="none" stroke="${teal}" stroke-width="0.5" opacity="0.15"/>
            <circle cx="${width / 2}" cy="${height / 2}" r="180" fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-dasharray="6,4" opacity="0.2"/>
            
            <!-- 星座连线 -->
            <path d="M 220 320 L 450 220 L 680 320 L 580 580 L 450 720 L 320 580 Z M 450 220 L 450 720" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.3" stroke-dasharray="1,3"/>
            <path d="M 170 480 L 320 580 M 730 480 L 580 580" fill="none" stroke="${teal}" stroke-width="1" opacity="0.22"/>
            
            <!-- 星座核心节点 -->
            <circle cx="220" cy="320" r="5.5" fill="#ffffff" opacity="0.85"/>
            <circle cx="450" cy="220" r="7.5" fill="${accent}" opacity="0.95"/>
            <circle cx="680" cy="320" r="5.5" fill="#ffffff" opacity="0.85"/>
            <circle cx="580" cy="580" r="5.5" fill="${teal}" opacity="0.95"/>
            <circle cx="450" cy="720" r="7.5" fill="#ffffff" opacity="0.85"/>
            <circle cx="320" cy="580" r="5.5" fill="${accent}" opacity="0.95"/>
        `;
    }

    return Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <defs>
                <radialGradient id="nebula" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stop-color="${teal}" stop-opacity="${radialGradientOpacity}"/>
                    <stop offset="60%" stop-color="${bg}" stop-opacity="0.12"/>
                    <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="vignette" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#020710" stop-opacity="0.45"/>
                    <stop offset="40%" stop-color="#020710" stop-opacity="0"/>
                    <stop offset="100%" stop-color="#020710" stop-opacity="0.75"/>
                </linearGradient>
            </defs>
            <!-- 背景暗化罩层 -->
            <rect width="${width}" height="${height}" fill="url(#nebula)"/>
            
            <!-- 分镜特定视觉装饰 -->
            ${specificContent}
            
            <!-- 星空点缀 -->
            <g>${stars}</g>
            
            <!-- 边缘羽化渐变暗角 -->
            <rect width="${width}" height="${height}" fill="url(#vignette)"/>
        </svg>
    `);
}

function introPaths(storyId) {
    const base = `assets/generated/story-intros/${storyId}`;
    return {
        poster: `${base}/poster.webp`,
        thumb: `${base}/thumb.webp`,
        frames: [1, 2, 3, 4].map((frame) => `${base}/frame-${String(frame).padStart(2, '0')}-v2.webp`)
    };
}

async function makeFrame(input, output, spec, storyId, frameIndex) {
    const [bg] = spec.palette;
    
    const explicitFrameIndex = frameIndex === 0 ? 1 : frameIndex;
    const explicitFramePng = join(root, `assets/images/${storyId}_frame_${explicitFrameIndex}.png`);
    const explicitFrameJpg = join(root, `assets/images/${storyId}_frame_${explicitFrameIndex}.jpg`);
    
    let processedSubject;
    let useExplicitFrame = false;

    if (existsSync(explicitFramePng)) {
        processedSubject = await sharp(explicitFramePng).resize(width, 840, { fit: 'cover' }).toBuffer();
        useExplicitFrame = true;
    } else if (existsSync(explicitFrameJpg)) {
        processedSubject = await sharp(explicitFrameJpg).resize(width, 840, { fit: 'cover' }).toBuffer();
        useExplicitFrame = true;
    }

    if (frameIndex > 0 && !useExplicitFrame) {
        return false; // Skip fallback frame generation
    }
    
    // Fallback to original cropping behavior if no explicit frame exists
    if (!useExplicitFrame) {
        const croppedBuffer = await sharp(input)
            .extract({ left: 0, top: 0, width: width, height: 840 })
            .toBuffer();

        let scale = 1.0;
        if (frameIndex === 2) {
            scale = 1.15;
        } else if (frameIndex === 3) {
            scale = 1.30;
        } else if (frameIndex === 4) {
            scale = 0.90;
        }

        if (scale >= 1.0) {
            const zoomWidth = Math.round(width * scale);
            const zoomHeight = Math.round(840 * scale);

            let extractLeft = Math.round((zoomWidth - width) / 2);
            let extractTop = Math.round((zoomHeight - 840) / 2);

            if (frameIndex === 2) {
                extractLeft = Math.max(0, extractLeft - 50);
            } else if (frameIndex === 3) {
                extractLeft = Math.min(zoomWidth - width, extractLeft + 50);
                extractTop = Math.max(0, extractTop - 40);
            }

            processedSubject = await sharp(croppedBuffer)
                .resize(zoomWidth, zoomHeight, { fit: 'cover' })
                .extract({ left: extractLeft, top: extractTop, width: width, height: 840 })
                .toBuffer();
        } else {
            const zoomWidth = Math.round(width * scale);
            const zoomHeight = Math.round(840 * scale);

            const padLeft = Math.round((width - zoomWidth) / 2);
            const padRight = width - zoomWidth - padLeft;
            const padTop = Math.round((840 - zoomHeight) / 2);
            const padBottom = 840 - zoomHeight - padTop;

            processedSubject = await sharp(croppedBuffer)
                .resize(zoomWidth, zoomHeight, { fit: 'contain', background: bg })
                .extend({ top: padTop, bottom: padBottom, left: padLeft, right: padRight, background: bg })
                .toBuffer();
        }
    }

    // 将 900x840 的主体在上下各补充 142px/143px 黑色/深色垫底，扩展到正好 900x1125，然后叠合 SVG
    await sharp(processedSubject)
        .extend({
            top: 142,
            bottom: 143,
            background: bg
        })
        .composite([
            { input: svgOverlay(spec, frameIndex), blend: 'over' }
        ])
        .webp({ quality: frameIndex === 0 ? 84 : 78, effort: 5 })
        .toFile(output);
    return true;
}

async function run() {
    mkdirSync(outputRoot, { recursive: true });

    const intros = [];
    const assets = [];

    for (const story of cardsData) {
        const spec = introSpecs[story.id];
        if (!spec) continue;

        const input = join(root, `assets/images/${story.id}.jpg`);
        if (!existsSync(input)) {
            throw new Error(`Missing source cover for ${story.id}: ${input}`);
        }

        const storyOutput = join(outputRoot, story.id);
        mkdirSync(storyOutput, { recursive: true });

        const paths = introPaths(story.id);
        const posterPath = join(root, paths.poster);
        const thumbPath = join(root, paths.thumb);
        const framePaths = [
            join(root, `assets/generated/story-intros/${story.id}/frame-01-v2.webp`),
            join(root, `assets/generated/story-intros/${story.id}/frame-02-v2.webp`),
            join(root, `assets/generated/story-intros/${story.id}/frame-03-v2.webp`),
            join(root, `assets/generated/story-intros/${story.id}/frame-04-v2.webp`)
        ];

        // 生成海报帧
        await makeFrame(input, posterPath, spec, story.id, 0);

        // 生成4个故事分镜漫画帧
        let hasAllFrames = true;
        for (let index = 0; index < 4; index += 1) {
            const success = await makeFrame(input, framePaths[index], spec, story.id, index + 1);
            if (success === false) {
                hasAllFrames = false;
                break;
            }
        }
        
        if (!hasAllFrames) {
            paths.frames = [];
        }

        // 生成缩略图
        await sharp(posterPath)
            .resize(320, 400, { fit: 'cover' })
            .webp({ quality: 76, effort: 5 })
            .toFile(thumbPath);

        const intro = {
            storyId: story.id,
            poster: paths.poster,
            thumb: paths.thumb,
            frames: paths.frames,
            videoUrl: null,
            caption: spec.caption,
            tone: spec.tone,
            motion: spec.motion,
            prompt: spec.prompt,
            styleSeed: `mst-${story.id}-20260609`,
            generatedAt,
            offline: true,
            frameCaptions: spec.frameCaptions
        };

        intros.push(intro);
        assets.push({ storyId: story.id, type: 'cover', src: `assets/images/${story.id}.jpg`, offline: true });
        assets.push({ storyId: story.id, type: 'intro-poster', src: paths.poster, offline: true });
        assets.push({ storyId: story.id, type: 'intro-thumb', src: paths.thumb, offline: true });
        paths.frames.forEach((src, index) => {
            assets.push({ storyId: story.id, type: 'intro-frame', frameIndex: index + 1, src, offline: true });
        });
    }

    const manifest = {
        version: 2,
        model: 'gpt-image-2',
        mode: 'ai-source-derivative-intro-films',
        generatedAt,
        description: 'AI visual asset registry for Mystic Star Tales. Story intro frames are generated from reviewed gpt-image-2 source covers and can be replaced by same-path model outputs without code changes.',
        intros,
        assets
    };

    writeFileSync(join(root, 'assets/generated/asset-manifest.json'), `${JSON.stringify(manifest, null, 4)}\n`);
    // Also write asset-manifest.js to assets/generated/ for file:// protocol support
    const generatedRoot = join(root, 'assets/generated');
    writeFileSync(join(generatedRoot, 'asset-manifest.js'), `window.MysticAppManifest = ${JSON.stringify(manifest, null, 2)};`);
    writeFileSync(join(outputRoot, 'index.json'), `${JSON.stringify({ version: 1, generatedAt, intros }, null, 4)}\n`);

    console.log(JSON.stringify({
        stories: intros.length,
        images: intros.length * 6,
        output: 'assets/generated/story-intros'
    }, null, 2));
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
