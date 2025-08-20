import { Collection } from 'discord.js';
import helloCommand from '../commands/hello';
import pingCommand from '../commands/ping';
import type { Command } from '../types/command';
import logger from '../utils/logger';

class CommandHandlerClass {
  private commands: Collection<string, Command>;

  constructor() {
    this.commands = new Collection<string, Command>();
    this.loadCommands();
  }

  private loadCommands(): void {
    const commandList: Command[] = [
      // Basic commands
      pingCommand,
      helloCommand,
    ];

    for (const command of commandList) {
      this.commands.set(command.data.name, command);
    }

    logger.info({ commandCount: this.commands.size }, 'Commands loaded successfully');
  }

  public getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  public getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  public getCommandData(): unknown[] {
    return this.getAllCommands().map((cmd) => cmd.data.toJSON());
  }
}

export const commandHandler = new CommandHandlerClass();
