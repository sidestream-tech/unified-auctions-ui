import Docker from 'dockerode';

const IMAGE_NAME = 'image-name';

const executeSpell = async function (repository: string, branch: string) {
    const docker = new Docker();
    console.info('executeSpell', repository, branch, __dirname, docker);
    const stream = await docker.buildImage(
        {
            context: __dirname,
            src: ['Dockerfile', 'file1', 'file2'],
        },
        { t: IMAGE_NAME },
        function (err: any, response: any) {
            console.info('buildImage err, response', err, response);
        }
    );
    await new Promise((resolve, reject) => {
        Docker.modem.followProgress(stream, (err: any, res: any) => (err ? reject(err) : resolve(res)));
    });
    console.info('executeSpell image built');
};

export default executeSpell;
