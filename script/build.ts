/**
 * 1. git 拉取 keystone admin 仓库并安装依赖
 *
 */

import execSh from 'exec-sh'
let count = 0
/**
 * 判断 keystone 是否启动成功
 */
const isAdminRun = () => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      execSh('yarn healthcheck', { cwd: './admin' }, (err) => {
        if (err) {
          if (count === 90) {
            reject(err)
          } else {
            count++
            resolve(isAdminRun())
          }
        }
        resolve('')
      })
      clearTimeout(timer)
    }, 2000)
  })
}
const main = async () => {
  console.log('---------------- start admin ----------------')
  const childProcess = execSh('yarn keystone:start > keystone-start.log 2>&1', { cwd: './admin' })

  try {
    await isAdminRun()
  } catch (e) {
    console.log('---------------- keystone start log (last 300 lines) ----------------')
    await execSh.promise('tail -300 ./admin/keystone-start.log || true')
    throw e
  }

  console.log('---------------- to next deploy ----------------')

  await execSh.promise('yarn next:build')
  console.log('---------------- finish build ----------------')
  childProcess.kill()
}

main()
