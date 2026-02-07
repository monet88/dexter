export interface Command {
  name: string;
  description: string;
  args?: string;
}

export const COMMANDS: Command[] = [
  { name: '/model', description: 'Chon provider va model' },
  { name: '/use', description: 'Chuyen sang profile', args: '<name>' },
  { name: '/settings', description: 'Liet ke profiles' },
  { name: '/settings add', description: 'Them profile moi' },
  { name: '/settings help', description: 'Hien huong dan' },
  { name: '/settings delete', description: 'Xoa profile', args: '<name>' },
];

export function filterCommands(input: string): Command[] {
  if (!input.startsWith('/')) return [];
  const search = input.toLowerCase();
  return COMMANDS.filter(cmd => cmd.name.toLowerCase().startsWith(search));
}
