const { SlashCommandBuilder } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

GlobalFonts.registerFromPath(
    path.join(__dirname, '../../assets/fonts/Noto-Regular.ttf'),
    'Noto'
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steam-carte')
        .setDescription('GÃ©nÃ¨re une carte Steam avec un utilisateur.')
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
                size: 256
            });

            const base = await loadImage(
                path.join(__dirname, '../../assets/images/steam-carte.png')
            );

            const avatar = await loadImage(avatarURL);

            const canvas = createCanvas(base.width, base.height);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#feb2c1';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(avatar, 12, 19, 205, 205);

            ctx.drawImage(base, 0, 0);

            ctx.font = '14px Noto';
            ctx.fillStyle = 'black';
            ctx.fillText(user.username, 16, 25);

            ctx.fillStyle = 'white';
            ctx.fillText(user.username, 15, 24);

            const buffer = canvas.toBuffer();

            if (buffer.length > 8 * 1024 * 1024) {
                return await interaction.reply("L'image dÃ©passe 8 Mo.");
            }

            return await interaction.reply({
                files: [{
                    attachment: buffer,
                    name: 'steam-carte.png'
                }]
            });

        } catch (err) {
            console.error(err);

            if (interaction.replied || interaction.deferred) {
                return await interaction.followUp(
                    "Erreur lors de la gÃ©nÃ©ration de l'image."
                );
            }

            return await interaction.reply(
                "Erreur lors de la gÃ©nÃ©ration de l'image."
            );
        }
    }
};