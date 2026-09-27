nst { SlashCommandBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ps4')
        .setDescription('GÃ©nÃ¨re une image PS4 avec un avatar.')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('Utilisateur Ã  utiliser')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const user =
                interaction.options.getUser('utilisateur') ||
                interaction.user;

            const avatarURL = user.displayAvatarURL({
                extension: 'png',
                size: 512
            });

            const base = await loadImage(
                path.join(__dirname, '../../assets/images/ps4.png')
            );

            const avatar = await loadImage(avatarURL);

            const canvas = createCanvas(
                base.width,
                base.height
            );

            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                avatar,
                0,
                75,
                410,
                449
            );

            ctx.drawImage(
                base,
                0,
                0
            );

            const buffer = canvas.toBuffer();

            if (buffer.length > 8 * 1024 * 1024) {
                return await interaction.reply("Image trop lourde.");
            }

            return await interaction.reply({
                files: [{
                    attachment: buffer,
                    name: 'ps4.png'
                }]
            });

        } catch (err) {
            console.error(err);

            if (interaction.replied || interaction.deferred) {
                return await interaction.followUp(
                    "Erreur gÃ©nÃ©ration PS4."
                );
            }

            return await interaction.reply(
                "Erreur gÃ©nÃ©ration PS4."
            );
        }
    }
};