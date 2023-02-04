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
    '0x7bc4b39adc7a3abf846e392f45ce327360064fac9c9dd8f1ee879215d530f797',
    '0x69b5ca1738c63f0b23772d5f779be6bb8fc05298028c2e1ee1d0a59442821fac',
    '0xc25f05073cf525a74a889a95ab25f14979be0f2d4e249623af1aaf866cb31201',
    '0xa9ceaffb3f8db45d781db52f059826dc33439a373e0a84cc03558e6bc3d3c59d',
    '0x7c9d91775149bd7c78f644840cd4873ebf7ff611685ba3be901b576f1668fda3',
    '0x997a62720a06fd8beba8f08be9688d9253f1ab5da4b732f2b2ac80139d731d83',
    '0x29a7dd8415ca2c0b754210fb206b2f10d77ec48e9122d8171f3ecc5a3739f695',
    '0x0428eea8256ad0179cf794acad79b8b972b10f488aed147d49ddd2fa6d40471f',
    '0xcd26e0feab61a6c315be3e161bcc753dbebb7ce09d1a87d158d249c3edf49f7e',
    '0x5470af10d8f6924503503aeebd4ede0c416330782ed2916da0b1ce57f826f5fe',
    '0x199380c461889548508c6e0268bc8c3a9d5fae1c5cbe9ad727e117db4d366148',
    '0xb56cf9f0ee9b3349464b74a7c9a7dc6971724fc731c2c3badf8865aaf014b0cc',
    '0x9617aac38a1d9de4ba712fd8a782f5d2047fb412358dab4fd57ade8b46b15e8e',
    '0x59383775af90f22813ce4d6329230b5bbb3983f6500958e16a9ed588feb4676d',
    '0xb2543203a6678ae54380179119026c4017d874aca4dce1f3a8410d78560ee014',
    '0x5e1c1facd56cbbcc2a0912f547f4081d8217a7857de508d7c0d9e37f44c95e63',
    '0x745d838a25fc9f2a7be8f1a926fc7bebe0d6b788b41d2ee44453b20d79cc919e',
    '0xc235043f258c50f19e73c21fa68b9b4d2e33efef1ce90f06f66be73ab73654fa',
    '0x7a71b064454f56e8a4640bb669839604da785e28c129b799d2fac1f49f4dd6ab',
    '0x424502c95ecc46d0aedc6e01354cb81eda0bd91a7cebaabc52571de799a6096b',
    '0xf16e7f6d9af3107389c1e6a545ba099cffb36820c22972ee69c96697423fe146',
    '0x2475871047d78c6bb95415b213a9cdbb98c1a6b8cb3e5e4d6bdb9ca2b59f17cc',
    '0x25755a5f59928faa37e78dadd7d45d1eea5946cb26b4993c89018d321225eb3d',
    '0x34110ffb1f59fb820e081d3fb63ae3f1b1b0a82c01786203e2844f35824133e0',
    '0x4d62ac83b888d52e4bdca5175e1137f986c5c20e9720613cd957be9b869bc6be',
    '0x325687b564aac2048083328afa6bf8f60c2dd4bfe4bf434cacf0da933dfad596',
    '0x2d5e0cb44b0bcb1ce1979914e2f5e1a431459385ddce1eff7dd59d88ba51686f',
    '0xc8ae397f6f73f411696ae1dd2f550081e4539dbe43ae7b62385c0da37df7a9f8',
    '0x2805f82a5c2688edb82faba829ced28a5b7f2cb141728279da21def96b35d09e',
    '0xcbc06657f623cf426ee96a3ef226b5ad47d35b3adaf71da2096a12b2095ae0d8',
    '0x5cef1d376739aed5880e412481d2c78e6d1a23d059ff583c8c7cba41d80f6c73',
    '0x2026d7114823aefd11b46637fa325cfe9f290edd67791e3179f52b16d754a872',
    '0xf7efb3640fe3dba79898e064c7c7a907e346fa83724d09348a9b44b17380732d',
    '0xbbef9d1954dd3b7f2be73c4fd2e0a2784f8539747e6d6ccfe0826cc39ad4c378',
    '0xc6d384e05b9c456e248085076024aeae4fd01a5b30967b04d02e0d605ff5b9a6',
    '0xde8b5e03dc432945113f970db51f1aa212f5b29fd6b4a7ef9ea37dc872312a3a',
    '0xafd09537a7144e5a191e10dce04ed177994b220468ee5892cd36707f43611dec',
    '0xafeb5233e2daa81520ba730adedcf0cd78bb61d9d5ff5459d31ca4c1004cb4f8',
    '0x77d71fde71bef8ccc16ea218aca09add10b64198b612bc4a6f08b5068d44597b',
    '0x02b307f2ed2ffde90c56df877b5d989345bc670e8545b2525e6102348b1d4f4c',
    '0xc24fdfd6ec6f2d9b7def0cea1877fdf69e4fee7bf3c85f918de96c9a7b644414',
    '0xad5a47d8ed10b8b0472d829a3c0d5c56178c1fc901fc6d0ceeafcf9644ffd8b5',
    '0xe1ccd2b0b87b740742222bf563bd76346c2dfe8e24689bb938fea313ced6df4f',
    '0x1c0ec7a777c932c62731fde21c4e9bd452190cb57d6a1b9e60e01661b3994b96',
    '0x3446e897e6a975788d457206b92b025a3b5e53bb1d1a4c9357b78bb793d0581d',
    '0x7578c3f2af56f0db8181bf89eb54601525d86fc9b83ee2b780216162533b27cc',
    '0xdf90f86efbbcd7af7bab5f8905d5975ce250c5c66509019b4024ed76ab5aba7f',
    '0xe1988405374cf24879f6e430fbb2b88fce8d2a057b1ae099f8e4cf4b063197aa',
    '0x2a5497428c30d3f514d3b56977817adedfafa4de2869ab62a4fbc8d62c99fc44',
    '0xe9ee644aac41ca59467f989ef6f8834c4998ce5242d304a78c23488a79baf8cf',
    '0xe3deef012f666d6bc329b84de3abd6629cec870b94e64fa5aaffdf7d679dad92',
    '0xf2390e7108833000ea7b1679f8d5c5c0efcb7ffbdacb1b2564c1448ee854f7cd',
    '0xbc9eed8ddfa8e6a610f4b86fa98d20287e0f9b8fa2c41b9b8b00ed6ae2d328c0',
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
    '2122',
    '4199',
    '4200',
    '914',
    '3239',
    '936',
    '1461',
    '4042',
    '2262',
    '4185',
    '937',
    '2431',
    '1318',
    '3711',
    '3051',
    '953',
    '902',
    '3192',
    '3568',
    '1108',
    '1256',
    '2361',
    '2371',
    '4084',
    '3576',
    '4333',
    '4334',
    '3052',
    '4451',
    '2084',
    '4474',
    '4483',
    '4475',
    '4476',
    '4477',
    '4085',
    '4337',
    '4478',
    '4494',
    '3817',
  ]);
  static lastBlockProcessed = 0;

  async processArtGlammed() {
    const glamList = (
      await axios.get(
        'https://api.artgobblers.com/api/trpc/user.me,page.recentlyGlaminated?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22take%22%3A64%2C%22filterNsfw%22%3Atrue%7D%7D%7D',
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
