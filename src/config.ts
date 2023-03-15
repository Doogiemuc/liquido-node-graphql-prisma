import fs from 'fs'
import yaml from 'js-yaml'

/** Read a configuration yaml file, depending on current NODE_ENV (dev, test, prod) */

let env = process.env.NODE_ENV || 'dev'
const config : any = yaml.load(fs.readFileSync('./config/config.'+env+'.yaml', 'utf8'))

export default config
