import { danger, message, warn } from 'danger'
import { TextLintEngine } from 'textlint'

export default async () => {
  await lint();
}

async function lint() {
  message('start dangerfile.ts')

  const editFiles = danger.git.modified_files.filter(e => !danger.git.deleted_files.includes(e))
  const createFiles = danger.git.created_files
  const files = [...editFiles, ...createFiles]

  const engine = new TextLintEngine()
  const dir = process.cwd()
  engine.executeOnFiles(files).then(results => {
    if (engine.isErrorResults(results)) {
      results.forEach(result => {
        const path = result.filePath.replace(`${dir}/`, '')
        result.messages.forEach(m => {
          const text = `${m.message} (${m.ruleId})`
          switch (m.severity) {
            case 0:
              // none, info
              message(text, path, m.line)
              break
            case 1:
              // warning
              warn(text, path, m.line)
              break
            case 2:
              // error
              warn(text, path, m.line)
              break
          }
        })
      })

      console.log(engine.formatResults(results))
    }
  })

  message('end dangerfile.ts')
}
