const { SlashCommandBuilder } = require('discord.js');
const { roleId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.addChoices(
					{ name: 'changelog', value: 'changelog' },
					{ name: 'update', value: 'update' },
					{ name: 'reload', value: 'reload' },
					{ name: 'uptime', value: 'uptime' },
					// { name: 'BotName', value: 'BotName' },
				)
				.setRequired(true),
		),
	category: 'utils',
	async execute(interaction) {

		const { roles } = interaction.member;
		if (roles.cache.has(`${roleId}`)) {
			console.log('all is good');
		} else {
			interaction.reply('you don\'t have enough permissions.');
			return;
		}

		const commandName = interaction.options.getString('command');
		const command1 = interaction.client.commands.get(commandName);

		if (!command1) {

			return interaction.reply(`There no command with name \`${commandName}\` !`);

		} else if (command1) {
			delete require.cache[require.resolve(`../${command1.category}/${command1.data.name}.js`)];

			try {
				interaction.client.commands.delete(command1.data.name);
				const newCommand = require(`../${command1.category}/${command1.data.name}.js`);
				interaction.client.commands.set(newCommand.data.name, newCommand);
				await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded !`);
				console.log(`Command \`${newCommand.data.name}\` was reloaded !`);
			} catch (error) {
				console.error(error);
				await interaction.reply(`There was an error while reloading a command \`${command1.data.name}\`:\n\`${error.message}\``);
			}
		}
	},
};