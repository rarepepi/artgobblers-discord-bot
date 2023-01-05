import { Injectable } from '@nestjs/common';
const { Webhook, MessageBuilder } = require('discord-webhook-node');
import axios from 'axios';
var cron = require('node-cron');
import { ethers } from 'ethers';

@Injectable()
export class AppService {
  static running = false;
  static gobblesAlreadySent = new Set([
    '0xaf41efe6a7854b20662bf43f06122e36f407819aaf540684ce511fa0582ded98',
    '0x5a21130f1b9f8419101c2c89c5801d3c8a84e7c9a4e1b9b98740c61cd6ac0d4a',
    '0xd616bc45da7261b2554001cb5a5aca3949bf5abe26c4b43b634bdc12104dfbeb',
    '0x32dd030bdd32642f0f5fad2d6d9bf96fca5642008d2326d6c21298e2eb04979c',
    '0x99c42b6e6e8c2e77ac010945465695f727ee782120938ef996338a723cfe3b3f',
    '0x7260e4bbdd121a9bf44e220e65f32bab8b4bfff978f32ff518e64df091531f45',
    '0xea89be6a26f92c51070111006ce0c50e7e855c2665446f2d1a693145a10460eb',
    '0xe951c50b9fda6777e7fb5a916ef11d99d74d195369d77198342e45692b0ed7f9',
    '0x5a55bbea49b243b92a43a36b155c5bfe9ef3d382589865565c2ccc55430b0488',
  ]);
  static glamAlreadySent = new Set([
    '393',
    '2257',
    '2302',
    '1191',
    '1693',
    '2328',
    '2065',
    '768',
    '2201',
    '1786',
    '2510',
    '2511',
    '2358',
    '1133',
    '2543',
    '1134',
    '618',
    '2544',
    '2222',
    '1789',
    '2306',
    '1694',
    '1702',
    '2464',
    '2506',
    '2126',
    '1916',
    '1805',
    '63',
    '2508',
    '2509',
    '2592',
    '2745',
    '1914',
    '684',
    '2062',
    '2061',
    '2202',
    '1668',
    '713',
    '2304',
    '1915',
    '195',
    '2256',
    '2119',
    '2120',
    '2121',
    '2929',
    '2545',
    '2961',
    '2463',
    '1563',
    '2758',
    '3046',
    '3076',
    '2970',
    '3153',
    '2173',
    '1593',
    '2809',
    '3176',
    '621',
    '775',
    '2733',
    '3719',
    '3718',
    '1917',
    '3717',
    '3715',
    '3714',
    '3713',
    '3690',
    '3688',
    '3615',
    '3535',
    '3613',
    '3581',
    '831',
    '3547',
    '3466',
    '2252',
    '3523',
    '1841',
    '3527',
    '3010',
    '1740',
    '3395',
    '3179',
    '794',
    '3354',
    '3435',
    '3178',
    '2974',
    '1135',
    '3383',
    '1862',
    '3352',
    '3720',
    '3676',
    '3797',
    '2794',
    '3764',
    '2835',
    '2500',
    '3465',
    '1857',
    '3765',
    '3793',
    '3794',
    '3795',
    '1575',
    '3550',
    '3553',
    '3707',
    '862',
    '169',
    '843',
    '4191',
  ]);
  static lastBlockProcessed = 0;

  async processArtGlammed() {
    const glamList = (
      await axios.get(
        'https://api.artgobblers.com/api/trpc/user.me,page.recentlyGlaminated?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22take%22%3A64%7D%7D%7D',
      )
    ).data[1].result.data.json;

    for (const glam of glamList) {
      if (AppService.glamAlreadySent.has(glam.id)) {
        continue;
      }

      const pageMetadata = (
        await axios.get(`https://nfts.artgobblers.com/api/pages/${glam.id}`)
      ).data;

      await this.sendDiscordMessageGlammed({
        pageMetadata,
        glamMetadata: glam,
      });

      AppService.glamAlreadySent.add(glam.id);
    }
  }

  async processArtGobbled() {
    const gobblersAddress = '0x60bb1e2aa1c9acafb4d34f71585d7e959f387769';
    const gobbleEventHash = ethers.utils.id(
      'ArtGobbled(address,uint256,address,uint256)',
    );
    const lastBlock = parseInt(
      (
        await axios.get(
          `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`,
        )
      ).data.result,
    );

    const txnList = await axios.get(
      `https://api.etherscan.io/api?module=logs&action=getLogs&address=${gobblersAddress}&fromBlock=${AppService.lastBlockProcessed}&toBlock=${lastBlock}&page=1&offset=1000&apikey=${process.env.ETHERSCAN_API_KEY}`,
    );

    const txns = txnList.data.result;
    for (const txn of txns) {
      if (AppService.gobblesAlreadySent.has(txn.transactionHash)) {
        continue;
      }
      if (txn.topics[0] === gobbleEventHash) {
        const gobblerTokenId = parseInt(txn.topics[2]);
        const pageTokenId = parseInt(txn.data);
        const gobblerMetadata = (
          await axios.get(
            `https://nfts.artgobblers.com/api/gobblers/${gobblerTokenId}`,
          )
        ).data;
        const pageMetadata = (
          await axios.get(
            `https://nfts.artgobblers.com/api/pages/${pageTokenId}`,
          )
        ).data;

        await this.sendDiscordMessageArtGobbled({
          gobblerId: gobblerTokenId,
          gobblerMetadata,
          pageId: pageTokenId,
          pageMetadata,
        });
        AppService.gobblesAlreadySent.add(txn.transactionHash);
      }
    }
    AppService.lastBlockProcessed = lastBlock;
  }

  async sendDiscordMessageGlammed(data: {
    pageMetadata: any;
    glamMetadata: any;
  }): Promise<void> {
    const artGlammedTitles = [
      `It's a masterpiece!`,
      'Picasso?',
      'Van Gogh?',
      'One for the history books!',
      'A true work of genius!',
      'A tour de force!',
      'A joy to behold!',
      'Simply breathtaking!',
      'An artistic triumph!',
    ];

    const hook = new Webhook(process.env.DISCORD_WEBHOOK);
    const addressOrEns =
      data.pageMetadata.attributes[1].value.indexOf('0x') > -1 &&
      data.pageMetadata.attributes[1].value.length === 42
        ? data.pageMetadata.attributes[1].value.substring(0, 6)
        : data.pageMetadata.attributes[1].value;
    const artWorkTitle = data.glamMetadata.drawing.artwork_title || 'Untitled';
    const embed = new MessageBuilder()
      .setTitle(
        artGlammedTitles[Math.floor(Math.random() * artGlammedTitles.length)],
      )
      .setURL(`https://artgobblers.com/page/${data.glamMetadata.id}`)
      .setDescription(`**${artWorkTitle}**  by ${addressOrEns}...`)
      .setThumbnail('https://i.imgur.com/X9Th2xX.gif')
      .setImage(data.glamMetadata.cdn_image_url)
      .setColor(data.pageMetadata.background_color);
    hook.send(embed);
  }

  async sendDiscordMessageArtGobbled(data: {
    gobblerId: number;
    gobblerMetadata: any;
    pageId: number;
    pageMetadata: any;
  }): Promise<void> {
    const hook = new Webhook(process.env.DISCORD_WEBHOOK);
    const artGobbledTitles = [
      'Looks delicious!',
      'Its a feast!',
      'Yum!',
      'Gobble gobble!',
      'Gobblicious',
      'Goo me Goo my',
      'Gobble very much',
    ];

    const assignedGobblerId = (
      await axios.get(
        `https://artgobblers.com/api/dev/gobbler-tokenid-to-assignedid?tokenId=${data.gobblerId}`,
      )
    ).data.assignedGobbledId;
    const addressOrEns =
      data.pageMetadata.attributes[1].value.indexOf('0x') > -1 &&
      data.pageMetadata.attributes[1].value.length === 42
        ? data.pageMetadata.attributes[1].value.substring(0, 6)
        : data.pageMetadata.attributes[1].value;
    const embed = new MessageBuilder()
      .setTitle(
        artGobbledTitles[Math.floor(Math.random() * artGobbledTitles.length)],
      )
      .setURL(`https://artgobblers.com/gobbler/${data.gobblerId}`)
      .setDescription(
        `**${data.gobblerMetadata.name.split(' –')[1]}** just gobbled ***"${
          data.pageMetadata.name.split(' –')[0]
        }"*** by ${addressOrEns}...`,
      )
      .setThumbnail(
        `https://storage.googleapis.com/gobblers-with-art.artgobblers.com/gifs/${assignedGobblerId}_${data.pageId}.gif`,
      )
      .setImage(data.pageMetadata.image)
      .setColor(data.pageMetadata.background_color);
    hook.send(embed);
  }

  async run(): Promise<string> {
    if (AppService.running) {
      return 'Already running!';
    }

    AppService.lastBlockProcessed =
      parseInt(
        (
          await axios.get(
            `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`,
          )
        ).data.result,
      ) - 10;

    cron.schedule('*/1 * * * *', async () => {
      await this.processArtGobbled();
      await this.processArtGlammed();
    });
    AppService.running = true;

    return 'Running!';
  }
}
