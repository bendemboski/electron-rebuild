import * as fs from 'fs-extra';
import * as path from 'path';
import { expect } from 'chai';
import { spawnPromise } from 'spawn-rx';

import { locateElectronModule } from '../src/electron-locator';

function packageCommand(command: string, packageName: string): Promise<string> {
  return spawnPromise('npm', [command, '--no-save', packageName], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'ignore',
  });
}

const install: ((s: string) => Promise<void>) = packageCommand.bind(null, 'install');
const uninstall: ((s: string) => Promise<void>) = packageCommand.bind(null, 'uninstall');

const testElectronCanBeFound = (): void => {
  it('should return a valid path', () => {
    const electronPath = locateElectronModule();
    expect(electronPath).to.be.a('string');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(fs.existsSync(electronPath!)).to.be.equal(true);
  });
};

describe('locateElectronModule', function() {
  this.timeout(30 * 1000);

  before(() => uninstall('electron'));

  it('should return null when electron is not installed', async () => {
    await fs.remove(path.resolve(__dirname, '..', 'node_modules', 'electron'));
    expect(locateElectronModule()).to.be.equal(null);
  });

  describe('with electron-prebuilt installed', () => {
    before(() => install('electron-prebuilt'));

    testElectronCanBeFound();

    after(() => uninstall('electron-prebuilt'));
  });

  describe('with electron installed', () => {
    before(() => install('electron'));

    testElectronCanBeFound();

    after(() => uninstall('electron'));
  });

  after(() => install('electron'));
});
