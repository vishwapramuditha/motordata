const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { simpleGit } = require('simple-git');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const ROOT_DIR = path.join(__dirname, '..');
const SCHEMAS_DIR = path.join(ROOT_DIR, 'schemas');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const git = simpleGit(ROOT_DIR);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Recursive file finder
async function getFiles(dir, relativeTo = dir) {
    let results = [];
    try {
        const list = await fs.readdir(dir, { withFileTypes: true });
        for (const dirent of list) {
            const res = path.join(dir, dirent.name);
            if (dirent.isDirectory()) {
                results = results.concat(await getFiles(res, relativeTo));
            } else if (res.endsWith('.json')) {
                results.push(path.relative(relativeTo, res).replace(/\\/g, '/'));
            }
        }
    } catch (err) { }
    return results;
}

// Get rich structure: split by series
app.get('/api/structure', async (req, res) => {
    try {
        const structure = {};
        
        // 1. Scan Schemas to find available Series
        try {
            const seriesFolders = await fs.readdir(SCHEMAS_DIR, { withFileTypes: true });
            for (const s of seriesFolders) {
                if (s.isDirectory()) {
                    const seriesName = s.name;
                    structure[seriesName] = { schemas: [], files: [] };
                    
                    const schemaFiles = await getFiles(path.join(SCHEMAS_DIR, seriesName));
                    structure[seriesName].schemas = schemaFiles.map(f => f.replace('.schema.json', ''));
                }
            }
        } catch (e) {
            console.error(e);
        }

        // 2. Scan Data folders for existing files
        try {
            const dataFolders = await fs.readdir(DATA_DIR, { withFileTypes: true });
            for (const d of dataFolders) {
                if (d.isDirectory()) {
                    const seriesName = d.name;
                    if (!structure[seriesName]) structure[seriesName] = { schemas: [], files: [] };
                    
                    structure[seriesName].files = await getFiles(path.join(DATA_DIR, seriesName));
                }
            }
        } catch (e) {
            console.error(e);
        }

        res.json(structure);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Load a specific schema
app.get('/api/schemas/:series/:schemaName', async (req, res) => {
    try {
        const filePath = path.join(SCHEMAS_DIR, req.params.series, req.params.schemaName + '.schema.json');
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Load existing data for a file
app.get('/api/data', async (req, res) => {
    try {
        const relativePath = req.query.file;
        if (!relativePath) return res.status(400).json({ error: 'file parameter is required' });
        
        const filePath = path.join(DATA_DIR, relativePath);
        
        try {
            await fs.access(filePath);
            const data = await fs.readFile(filePath, 'utf8');
            res.json(JSON.parse(data));
        } catch {
            res.json({ _isNew: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save data back to filesystem (creates folders automatically)
app.post('/api/data', async (req, res) => {
    try {
        const { file, content } = req.body;
        if (!file || !content) return res.status(400).json({ error: 'file and content are required' });

        const filePath = path.join(DATA_DIR, file);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
        res.json({ success: true, message: `Successfully saved ${file}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Git Push
app.post('/api/git/push', async (req, res) => {
    try {
        const { message = 'Data update via Admin Dashboard' } = req.body;
        await git.add('data/*');
        const status = await git.status();
        
        if (status.staged.length > 0) {
            await git.commit(message);
            await git.push();
            res.json({ success: true, message: `Successfully pushed ${status.staged.length} files to GitHub.` });
        } else {
            res.json({ success: true, message: 'No changes detected to push.', noChanges: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.listen(PORT, () => {
    console.log(`MotorData Admin Dashboard running at http://localhost:${PORT}`);
});
