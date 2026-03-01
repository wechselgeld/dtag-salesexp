const fs = require('fs');
const files = [
    {
        path: 'src/components/features/auth-intro/intro-splash.tsx',
        replacements: [{ search: /'\.\/telekom-logo'/g, replace: "'@/components/shared/telekom-logo'" }]
    },
    {
        path: 'src/components/features/availability/availability-check-modal.tsx',
        replacements: [{ search: /'\.\/skeleton'/g, replace: "'@/components/shared/skeleton'" }]
    },
    {
        path: 'src/components/features/basket/basket-drawer.tsx',
        replacements: [{ search: /'\.\.\/skeleton'/g, replace: "'@/components/shared/skeleton'" }]
    },
    {
        path: 'src/components/features/calculator/credit-selector.tsx',
        replacements: [{ search: /'\.\.\/skeleton'/g, replace: "'@/components/shared/skeleton'" }]
    },
    {
        path: 'src/components/features/maintenance/maintenance-splash.tsx',
        replacements: [{ search: /'\.\/telekom-logo'/g, replace: "'@/components/shared/telekom-logo'" }]
    },
    {
        path: 'src/components/features/news/news-carousel.tsx',
        replacements: [{ search: /'\.\/skeleton'/g, replace: "'@/components/shared/skeleton'" }]
    }
];

files.forEach(f => {
    if (!fs.existsSync(f.path)) return;
    let content = fs.readFileSync(f.path, 'utf8');
    let changed = false;
    f.replacements.forEach(r => {
        if (r.search.test(content) || content.includes(r.search.toString().replace(/\//g,'').replace(/'/g,""))) {
           content = content.replace(r.search, r.replace);
           changed = true;
           // Also do double quotes
           const dqSearch = new RegExp(r.search.source.replace(/'/g, '\"'), 'g');
           const dqReplace = r.replace.replace(/'/g, '\"');
           content = content.replace(dqSearch, dqReplace);
        } else {
           // Also do double quotes
           const dqSearch = new RegExp(r.search.source.replace(/'/g, '\"'), 'g');
           const dqReplace = r.replace.replace(/'/g, '\"');
           if (dqSearch.test(content)) {
               content = content.replace(dqSearch, dqReplace);
               changed = true;
           }
        }
    });
    if (changed) fs.writeFileSync(f.path, content);
});
