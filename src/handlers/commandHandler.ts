import { Collection } from 'discord.js';
import analyticsCommand from '../commands/databuddy/analytics';
import askCommand from '../commands/databuddy/ask';
import eventsCommand from '../commands/databuddy/events';
import topPagesCommand from '../commands/databuddy/top-pages';
import websitesCommand from '../commands/databuddy/websites';
import helloCommand from '../commands/hello';
import pingCommand from '../commands/ping';
import type { Command } from '../types/command';

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

      // Databuddy commands
      analyticsCommand,
      topPagesCommand,
      websitesCommand,
      eventsCommand,
      askCommand,
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
    return this.getAllCommands().map((cmd) => cmd.data.toJSON());
  }
}

export const commandHandler = new CommandHandlerClass();
