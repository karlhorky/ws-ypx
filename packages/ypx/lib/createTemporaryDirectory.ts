/**
 * Created by user on 2020/1/28.
 */
import { dir as tmpDir } from 'tmp';
import Bluebird from 'bluebird';
import { join } from 'path';
import { sync as crossSpawnExtra } from 'cross-spawn-extra';
import { pathExistsSync } from 'fs-extra';

export function getCacheDir(): string
{
	try
	{
		let cp = crossSpawnExtra('yarn', [
			'config',
			'current',
			'--json',
		], {
			stripAnsi: true
		});

		let data = JSON.parse(JSON.parse(cp.stdout.toString()).data);

		if (data.tempFolder)
		{
			return data.tempFolder
		}
	}
	catch (e)
	{

	}

	if (process.env.YARN_CACHE_FOLDER && pathExistsSync(process.env.YARN_CACHE_FOLDER))
	{
		return join(process.env.YARN_CACHE_FOLDER, '_ypx')
	}
}

export function createTmpDir()
{
	return new Bluebird<string>((resolve, reject) =>
	{
		tmpDir({
			unsafeCleanup: false,
			prefix: 'ypx_',
			dir: getCacheDir(),
		}, (error, dirPath) =>
		{
			if (error)
			{
				reject(error);
			}
			else
			{
				resolve(dirPath);
			}
		});
	})
}

export function createTemporaryDirectory()
{
	return createTmpDir()
		//.tap(v => console.dir(v))
	;
}

export default createTemporaryDirectory
