const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
const readFileAsync = promisify(fs.readFile);
// const { roleId } = require('../config.json');


function compareVersions(version1, version2) {
	const v1 = version1.split('_').map(Number);
	const v2 = version2.split('_').map(Number);

	for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
		const num1 = v1[i] || 0;
		const num2 = v2[i] || 0;

		if (num1 > num2) {
			return 1;
		} else if (num1 < num2) {
			return -1;
		}
	}
	return 0;
}

module.exports = {
	name: Events.InteractionCreate,
	once: false,

	/**
	 * @param {Discord.Interaction} interaction
	 */

	async execute(interaction) {
		if (interaction.isModalSubmit()) {
			console.log('customId of the modal send by ' + interaction.user.tag + ' : ' + interaction.customId);
			if (interaction.customId === 'updater') {

				const updateFilePath = path.join(__dirname, '../commands/changelog/config');
				const dataConfig = await readFileAsync(`${updateFilePath}/update.json`, 'utf8');
				const jsonDataConfig = JSON.parse(dataConfig);
				const project = jsonDataConfig.project;

				const number = interaction.fields.getTextInputValue('numberInput');
				const bugsFix = interaction.fields.getTextInputValue('bugsFixInput');
				const add = interaction.fields.getTextInputValue('addInput');
				const modifs = interaction.fields.getTextInputValue('modifsInput');

				const pattern = /^\d+\.\d+\.\d+$/;
				const isValid = pattern.test(number);

				if (isValid) {
					const today = new Date();
					const day = String(today.getDate()).padStart(2, '0');
					const month = String(today.getMonth() + 1).padStart(2, '0');
					const year = today.getFullYear();
					const formattedDate = `${day}/${month}/${year}`;

					const folderPath = path.join(__dirname, `../changelogs/${project}`);

					const changelogNumber = number.replace(/\./g, '_');

					const fileName = `${folderPath}/${changelogNumber}.json`;

					const changelogContent = {
						'date': `${formattedDate}`,
						'fixs': `${bugsFix}`,
						'adds': `${add}`,
						'modifs_upgrades': `${modifs}`,
					};

					// Convertir les paramètres en chaîne JSON
					const changelogJson = JSON.stringify(changelogContent);

					// Vérifier si le fichier existe déjà
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
					const latestChangelogNumber = latestFile.replace('.json', '');

					// Comparer les versions
					const comparisonResult = compareVersions(changelogNumber, latestChangelogNumber);

					if (comparisonResult > 0) {
						console.log('The new changelog is more recent, everything is good.');
					} else {
						interaction.reply('Please create the changelog for a version higher than the previous changelog.');
						return;
					}

					fs.writeFile(fileName, changelogJson, (err) => {
						if (err) {
							console.error(err);
							return;
						}
						console.log(`The ${fileName} file has been created successfully.`);
					});

					const icon = new AttachmentBuilder(`${folderPath}/res/icon/icon.png`);

					const dataSettings = await readFileAsync(`${folderPath}/res/config/settings.json`, 'utf8');
					const jsonDataSettings = JSON.parse(dataSettings);
					const colorAncient = jsonDataSettings.color;
					const color = parseInt(colorAncient.replace(/^#/, ''), 16);

					const embed = new EmbedBuilder()
						.setColor(color)
						.setTitle(`${project} - Update changelog ${number}`)
						.setThumbnail('attachment://icon.png')
						.addFields(
							{ name: 'Fixed bugs : ', value: '```' + bugsFix + '```' },
							{ name: 'Additions : ', value: '```' + add + '```' },
							{ name: 'Improvements / Modifications : ', value: '```' + modifs + '```' },
						)
						.setFooter({ text: `${formattedDate} - ${project}` });

					await interaction.reply({ embeds: [embed], files: [icon] });
					console.log('embed sent successfully !');
					return;
				} else {
					console.log('The format is invalid !');
					interaction.reply('Please enter a correct changelog number in the form X.X.X with whole numbers between 0 and 9 inclusive.');
					return;
				}
			}
		}

		const command = interaction.client.commands.get(interaction.commandName);

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			console.error(`Error executing ${interaction.commandName}`);
			await interaction.reply({ content: 'There was an error while executing this command !', ephemeral: true });
		}
	},
};