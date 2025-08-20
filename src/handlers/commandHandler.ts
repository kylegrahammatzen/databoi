import { Collection } from 'discord.js';
import type { Command } from '../types/command';
import pingCommand from '../commands/ping';
import helloCommand from '../commands/hello';

class CommandHandlerClass {
  private commands: Collection<string, Command>;

  constructor() {
    this.commands = new Collection<string, Command>();
    this.loadCommands();
  }

  private loadCommands(): void {
    const commandList: Command[] = [
      pingCommand,
      helloCommand
    ];

    for (const command of commandList) {
      this.commands.set(command.data.name, command);
    }

    console.log(`Loaded ${this.commands.size} commands`);
  }

  public getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  public getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  public getCommandData(): unknown[] {
    return this.getAllCommands().map(cmd => cmd.data.toJSON());
  }
}

export const commandHandler = new CommandHandlerClass();