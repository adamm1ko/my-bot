const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const TOKEN = process.env.DISCORD_TOKEN; // سيتم سحبه من إعدادات الاستضافة
const CATEGORY_ID = 'ضع_هنا_أيدي_القسم_الذي_تفتح_فيه_التذاكر';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// أمر إنشاء رسالة التذاكر
client.on('messageCreate', async (message) => {
    if (message.content === '!setup-ticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
            .setTitle('نظام التذاكر | Support System')
            .setDescription('لفتح تذكرة جديدة، اضغط على الزر أدناه 📩')
            .setColor('#0099ff');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('فتح تذكرة')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📩'),
            );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// التفاعل مع الأزرار
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'create_ticket') {
        // إنشاء قناة التذكرة
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        const embed = new EmbedBuilder()
            .setTitle('تم فتح تذكرتك!')
            .setDescription(`أهلاً بك ${interaction.user}، سيقوم فريق الدعم بالرد عليك قريباً.`)
            .setColor('#00ff00');

        const closeRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('إغلاق التذكرة')
                    .setStyle(ButtonStyle.Danger),
            );

        await channel.send({ embeds: [embed], components: [closeRow] });
        await interaction.reply({ content: `تم فتح التذكرة بنجاح: ${channel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply('سيتم إغلاق التذكرة خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

client.login(TOKEN);
