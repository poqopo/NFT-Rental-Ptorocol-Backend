import pg from "pg";
import Caver from "caver-js";
import "ipfs";
import erc721json from "../../ERC721.json" assert { type: "json" }


export default function query(result) {
    const config = {
        host: 'localhost',
        user: 'test',     
        password: 'test',
        database: 'postgres',
        port: 5432,
    };
    
    const client = new pg.Client(config);
    
    client.connect(err => {
        if (err) throw err;
        else {
            queryDatabase(result);
        }
    });

    const NFTlist = (data) => {
        console.log("find NFTlist event")
    
        const query = 'INSERT INTO public."ListedNFT" (collection_address, token_id, holder_account, collateral_token, collateral_amount, max_rent_duration, rent_fee_per_block) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT ' +
                      '(collection_address, token_id) DO UPDATE SET collection_address=$1, token_id=$2, holder_account=$3, collateral_token=$4, collateral_amount=$5, max_rent_duration=$6, rent_fee_per_block=$7'
        const contents = data.returnValues

        client
        .query(query, [contents.collection_address.toString(), parseInt(contents.token_id), contents.holder_address.toString(), contents.collateral_token.toString(), parseInt(contents.collateral_amount), parseInt(contents.max_rent_duration), parseInt(contents.rent_fee_per_block)])
        .then((res) => {
            console.log('LISTEDNFT UPSERT successfully!');
            // client.end(console.log('Closed client connection'));
        })
        .catch(err => console.log(err))
        .then(() => {
            console.log('Finished execution, exiting now');
        })
    }

    const NFTinfo = async (data) => {
      console.log("Welcome to NFTinfo!");
      const contents = data.returnValues;
      const caver = new Caver("https://api.baobab.klaytn.net:8651/");

      const erc721 = new caver.klay.Contract(
        erc721json.abi,
        contents.collection_address
      );

      const url = await erc721.methods.tokenURI(contents.token_id).call();
      if (url.startsWith("ipfs://")) {
      fetch("https://ipfs.io/ipfs/" + url.split("ipfs://")[1])
        .then((response) => response.json())
        .then((data) => {
          const query =
            'INSERT INTO public."NFT" (collection_address, token_id, nft_name, nft_image, description) VALUES($1,$2,$3,$4,$5) ON CONFLICT ' +
            "(collection_address, token_id) DO UPDATE SET collection_address=$1, token_id=$2, nft_name=$3, nft_image=$4, description=$5";
          client
            .query(query, [
              contents.collection_address,
              parseInt(contents.token_id),
              data.name,
              data.image,
              data.description
            ])
            .then((res) => {
              console.log("NFT UPSERT successfully!");
            })
            .catch((err) => console.log(err))
            .then(() => {
              console.log("Finished execution, exiting now");
            });
        });
      } else {
        fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const query =
            'INSERT INTO public."NFT" (collection_address, token_id, nft_name, nft_image, description) VALUES($1,$2,$3,$4,$5) ON CONFLICT ' +
            "(collection_address, token_id) DO UPDATE SET collection_address=$1, token_id=$2, nft_name=$3, nft_image=$4, description=$5";
          client
            .query(query, [
              contents.collection_address,
              parseInt(contents.token_id),
              data.name,
              data.image,
              data.description
            ])
            .then((res) => {
              console.log(res.rows[0]);
              console.log("NFT UPSERT successfully!");
            })
            .catch((err) => console.log(err))
            .then(() => {
              console.log("Finished execution, exiting now");
            });
        });

      }

    };
    

    const NFTcancel = (data) => {
        console.log("find NFTcancel event")
    
        const query = 'DELETE FROM public."ListedNFT" WHERE collection_address=$1 AND token_id=$2'
        const contents = data.returnValues

        client
        .query(query, [contents.collection_address.toString(), parseInt(contents.token_id)])
        .then((res) => {
            console.log('DELETE successfully!');
        })
        .catch(err => console.log(err))
        .then(() => {
            console.log('Finished execution, exiting now');
        })
    }

    
    
    function queryDatabase(data) {
        console.log("receive data")
    
        if (data.event === "NFTlist") {
            NFTinfo(data)
            NFTlist(data)
        }
        if (data.event === "NFTlistcancel") {
            NFTcancel(data)
        }
    
    }
}


