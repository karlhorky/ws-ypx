import { ITSRequiredWith } from 'ts-type';
import { IYPXArguments, IRuntimeCache } from './types';
import crossSpawnExtra from 'cross-spawn-extra';
import Bluebird from 'bluebird';
import findCommand from './findCommand';
import { dirname } from 'path';

export async function installDependencies(argv: IYPXArguments, runtime: IRuntimeCache)
{
	let pkgs = argv.package.slice();

	if (argv.ignoreExisting)
	{

	}
	else
	{
		pkgs = await Bluebird.resolve(pkgs)
			.filter(async (name) => {

				let r: string;

				try
				{
					r = require.resolve(name + '/package.json', {
						paths: [argv.cwd]
					});
					runtime.skipInstall[name] = r;
					return false;
				}
				catch (e)
				{

				}

				if (r = await findCommand(name, argv.cwd))
				{
					runtime.skipInstall[name] = r;
					return false;
				}

				return true;
			})
		;
	}

	if (pkgs.length)
	{
		if (argv.noInstall)
		{
			pkgs.forEach(name => runtime.skipInstall[name] = undefined)
		}
		else
		{
			await crossSpawnExtra('yarn', [
				'add',
				...pkgs,
				(argv.quiet ? '--quiet' : null),
				(argv.preferOffline ? '--refer-offline' : null),
				'--link-duplicates',
				'--no-node-version-check',
				'--ignore-optional',
			].filter(v => v != null), {
				stripAnsi: true,
				cwd: runtime.tmpDir,
				stdio: argv.quiet ? undefined : 'inherit',
			});
		}
	}
}

export default installDependencies
