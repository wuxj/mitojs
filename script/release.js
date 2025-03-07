const chalk = require('chalk')

const { getArgv, targets: allTargets, binRun } = require('./utils')
const path = require('path')
const fs = require('fs')
const step = (msg) => console.log(chalk.cyan(msg))
const getPkgRoot = (pkg) => path.resolve(__dirname, '../packages/' + pkg)

let beReleasedPackages = []

run()
async function run() {
  const argv = getArgv()
  beReleasedPackages = argv._
  release()
}

async function release() {
  step('\ncollect be released packages...')
  if (beReleasedPackages.length === 0) {
    beReleasedPackages = allTargets
  }
  step(`\nbeReleasedPackages: ${beReleasedPackages.join('\n')}`)
  beReleasedPackages.forEach((target) => {
    publicPackage(target)
  })
}

async function publicPackage(pkgName) {
  const pkgRoot = getPkgRoot(pkgName)
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = require(pkgPath)
  const version = pkg.version
  if (pkg.private) return
  fs.access(`${pkgRoot}/dist`, fs.constants.F_OK, async (err) => {
    if (err) {
      console.log(chalk.red(`${pkgName} don't have dist folder`))
      return
    }
    step(`Publishing ${pkgName}...`)
    try {
      await binRun('yarn', ['publish', '--new-version', version, '--access', 'public'], {
        cwd: pkgRoot,
        stdio: 'pipe'
      })
      console.log(chalk.green(`Successfully published ${pkgName}@${version}`))
    } catch (error) {
      console.log(`failed publish ${pkgName}@${version}`, error)
    }
  })
}
