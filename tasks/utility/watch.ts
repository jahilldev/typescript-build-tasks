import chokidar from 'chokidar';

chokidar.watch('./src/style', {ignored: /(^[\/\\])\../}).on('all', (event: string, path: string) => {
    console.log(event, path);
})
