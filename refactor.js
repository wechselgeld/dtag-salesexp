const fs = require('fs');
const path = require('path');

const componentMappings = {
    'admin': 'features/admin',
    'basket': 'features/basket',
    'calculator': 'features/calculator',
    'products': 'features/products',
    'battlecards': 'features/battlecards',
    'ui': 'shared/ui',
    'app-shell.tsx': 'layout/app-shell.tsx',
    'sidebar-nav.tsx': 'layout/sidebar-nav.tsx',
    'search-bar.tsx': 'features/search/search-bar.tsx',
    'onboarding-tutorial.tsx': 'features/onboarding/onboarding-tutorial.tsx',
    'category-grid.tsx': 'features/products/category-grid.tsx',
    'news-carousel.tsx': 'features/news/news-carousel.tsx',
    'global-news-notification.tsx': 'features/news/global-news-notification.tsx',
    'availability-check-modal.tsx': 'features/availability/availability-check-modal.tsx',
    'maintenance-splash.tsx': 'features/maintenance/maintenance-splash.tsx',
    'intro-splash.tsx': 'features/auth-intro/intro-splash.tsx',
    'streaming-calculator-modal.tsx': 'features/calculator/streaming-calculator-modal.tsx',
    'battlecard-panel.tsx': 'features/battlecards/battlecard-panel.tsx',
    'skeleton.tsx': 'shared/skeleton.tsx',
    'telekom-logo.tsx': 'shared/telekom-logo.tsx'
};

const srcComponents = path.join(__dirname, 'src', 'components');

function copyFolderSync(from, to) {
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
        } else {
            copyFolderSync(fromPath, toPath);
        }
    });
}

function getFiles(dir, files = []) {
    fs.readdirSync(dir).forEach(file => {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            getFiles(p, files);
        } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
            files.push(p);
        }
    });
    return files;
}

// 1. Copy files
Object.entries(componentMappings).forEach(([oldPath, newPath]) => {
    const oldFullPath = path.join(srcComponents, oldPath);
    const newFullPath = path.join(srcComponents, newPath);
    
    if (fs.existsSync(oldFullPath)) {
        fs.mkdirSync(path.dirname(newFullPath), { recursive: true });
        if (fs.statSync(oldFullPath).isDirectory()) {
            copyFolderSync(oldFullPath, newFullPath);
            fs.rmSync(oldFullPath, { recursive: true, force: true });
        } else {
            fs.renameSync(oldFullPath, newFullPath);
        }
    }
});

// 2. Fix imports globally
const files = getFiles(path.join(__dirname, 'src'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    const sortedMappings = Object.entries(componentMappings).sort((a,b) => b[0].length - a[0].length);
    
    sortedMappings.forEach(([oldPath, newPath]) => {
        const oldImport = '@/components/' + oldPath.replace('.tsx', '');
        const newImport = '@/components/' + newPath.replace('.tsx', '');
        
        const regex = new RegExp(oldImport.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '(?=[\/\"\'])', 'g');
        if (regex.test(content)) {
            content = content.replace(regex, newImport);
            changed = true;
        }
    });
    
    if (file.replace(/\\\\/g, '/').endsWith('features/battlecards/battlecard-panel.tsx')) {
        if (content.includes('./battlecards/')) {
            content = content.replace(/\.\/battlecards\//g, './');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content);
    }
});

console.log('Refactoring complete');
