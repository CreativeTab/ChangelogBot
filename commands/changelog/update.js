const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('node:path');
const { roleId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Update the changelog of a project.')
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName('project')
				.setDescription('Name of the project')
				.addChoices(
					{ name: 'The name of your project', value: 'your_project_name' },
					// { name: 'BotName', value: 'BotName' },
				)
				.setRequired(true),
		),
	category: 'changelog',
	async execute(interaction) {

		const { roles } = interaction.member;
		if (roles.cache.has(`${roleId}`)) {
			console.log('all is good');
		} else {
			interaction.reply('you don\'t have enough permissions.');
			return;
		}

		const category1 = interaction.options.getString('project');

		const update = {
			'project': `${category1}`,
		};

		// Convertir les paramètres en chaîne JSON
		const updateJson = JSON.stringify(update);

		const updateFilePath = path.join(__dirname, '../changelog/config');

		fs.writeFile(`${updateFilePath}/update.json`, updateJson, err => {
			if (err) throw err;
			console.log('The parameters have been saved in the update.json file');
		});

		const folderPath = path.join(__dirname, `../../changelogs/${category1}`);
		const changelogFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

		const latestFile = changelogFiles.reduce((latest, file) => {
			const [primaryLatest, secondaryLatest, tertiaryLatest] = latest.replace('.json', '').split('_').map(Number);
			const [primary, secondary, tertiary] = file.replace('.json', '').split('_').map(Number);

			if (primary > primaryLatest || (primary === primaryLatest && secondary > secondaryLatest) || (primary === primaryLatest && secondary === secondaryLatest && tertiary > tertiaryLatest)) {
				return file;
			} else {
				return latest;
			}
		});

		const OldChangelogNumber = latestFile.replace('.json', '').split('_').map(Number);
		const changelogNumber = OldChangelogNumber.join('.');

		// Create the modal
		const modal = new ModalBuilder()
			.setCustomId('updater')
			.setTitle(`${category1}`)
			.setComponents(
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId('numberInput')
						.setLabel('What is the changelog number ?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder(`Latest changelog : ${changelogNumber}`)
						.setRequired(true),
				),
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId('bugsFixInput')
						.setLabel('Which bugs have been fixed ?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Bug fixes ...')
						.setRequired(true),
				),
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId('addInput')
						.setLabel('What has been added ?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Added ....')
						.setRequired(true),
				),
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId('modifsInput')
						.setLabel('What has been changed / improved ?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('changes / improvements ...')
						.setRequired(true),
				),
			);

		await interaction.showModal(modal);
		console.log('modal sent !');
	},
};