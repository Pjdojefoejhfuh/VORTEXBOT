const { SlashCommandBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('@napi-rs/canvas');
const path = require('path');

registerFont(
    path.join(__dirname, '../../assets/fonts/arial.ttf'),
    { family: 'arial' }
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('d-profil')
        .setDescription('GÃ©nÃ¨re une image de profil')
        .addUserOption(option =>
            option
                .setName('membre')
                .setDescription('Le membre Ã  utiliser')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('cause')
                .setDescription('Cause Ã  afficher sur lâ€™image')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const user =
                interaction.options.getUser('membre') ||
                interaction.user;

            const cause =
                interaction.options.getString('cause') || '';

            const avatarURL = user.displayAvatarURL({
                extension: 'png',
                size: 512
            });

            const avatar = await loadImage(avatarURL);
            const base = await loadImage(
                path.join(__dirname, '../../assets/images/d-profil.png')
            );

            const canvas = createCanvas(base.width, base.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(avatar, 20, 20, 92, 92);
            ctx.drawImage(base, 0, 0);

            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.font = 'bold 11pt arial';
            ctx.fillStyle = 'white';

            ctx.fillText(user.tag, 190, 40, 305);

            if (cause) {
                ctx.fillText(cause, 438, 910, 500);
            }

            const buffer = canvas.toBuffer();

            if (buffer.length > 8 * 1024 * 1024) {
                return await interaction.reply("L'image dÃ©passe 8 Mo.");
            }

            await interaction.reply({
                files: [{
                    attachment: buffer,
                    name: 'd-profil.png'
                }]
            });
        } catch (err) {
            console.error(err);
            await interaction.reply(
                "Erreur lors de la gÃ©nÃ©ration de l'image."
            );
        }
    }
};