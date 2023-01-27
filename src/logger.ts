import chalk from 'chalk';

export const print = (...args: unknown[]) => {
  console.log(chalk.hex('#2FA9FF')(new Date().toISOString()), chalk.hex('#0F8CE6')('(kodik-video-links)'), chalk.hex('#98D4FF')(...(<string[]> args)))
  // console.log(`\u001b[38;5;84m[${new Date().toISOString()}]`, '\u001b[33m[bh-orders]\u001b[38;5;111m', ...args, '\u001b[0m');
  return print;
};

print.create = (...args: unknown[]) => {
  return print.bind(this, ...args);
};

export const printServer = print.create('(server)');
export const printKodikwrapper = print.create('(kodikwrapper)');
export const printParser = print.create('(parser)');
export const printVideoLinks = print.create('(video-links)');