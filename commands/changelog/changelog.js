const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
const readFileAsync = promisify(fs.readFile);
const { roleId } = require('../../config.json');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('changelog')
		.setDescription('Give the changelog of a project.')
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

		const ancientChangelogNumber = latestFile.replace('.json', '').split('_').map(Number);
		const changelogNumber = ancientChangelogNumber.join('.');

		try {
			const data = await readFileAsync(`${folderPath}/res/config/settings.json`, 'utf8');
			const jsonDataColor = JSON.parse(data);
			const colorAncient = jsonDataColor.color;
			const color = parseInt(colorAncient.replace(/^#/, ''), 16);

			try {
				const dataLatestFile = await readFileAsync(`${folderPath}/${latestFile}`, 'utf8');
				const jsonDataLatestFile = JSON.parse(dataLatestFile);

				const changelogDate = jsonDataLatestFile.date;
				const changelogBugsFix = jsonDataLatestFile.fixs;
				const changelogAdd = jsonDataLatestFile.adds;
				const changelogModifs = jsonDataLatestFile.modifs_upgrades;

				const icon = new AttachmentBuilder(`${folderPath}/res/icon/icon.png`);

				const exampleEmbed = new EmbedBuilder()
					.setColor(color)
					.setTitle(`${category1} - changelog ${changelogNumber}`)
					.setThumbnail('attachment://icon.png')
					.addFields(
						{ name: 'Fixed bugs : ', value: '```' + changelogBugsFix + '```' },
						{ name: 'Additions : ', value: '```' + changelogAdd + '```' },
						{ name: 'Improvements / Modifications : ', value: '```' + changelogModifs + '```' },
					)
					.setFooter({ text: `${changelogDate} - ${category1}` });

				console.log('embed sent !');
				await interaction.reply({ embeds: [exampleEmbed], files: [icon] });

			} catch (err) {
				console.error('Error parsing the JSON file in the changelog : ', err);
				await interaction.editReply('An error occurred when trying to retrieve data from the changelog.');
			}
		} catch (err) {
			console.error('Error parsing settings JSON file : ', err);
			await interaction.editReply('An error occurred during colour recovery.');
		}
	},
};