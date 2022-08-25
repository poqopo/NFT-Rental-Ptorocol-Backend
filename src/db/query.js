import pg from "pg";
import Caver from "caver-js";
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
        .query(query, [contents.collection_address.toString(), parseInt(contents.token_id), contents.from_address.toString(), contents.collateral_token.toString(), parseInt(contents.collateral_amount), parseInt(contents.max_rent_duration), parseInt(contents.rent_fee_per_block)])
        .then((res) => {
            console.log('LISTEDNFT UPSERT successfully!');
            // client.end(console.log('Closed client connection'));
        })
        .catch(err => console.log(err))
        .then(() => {
            console.log('Finished execution, exiting now');
        })
    }

    const NFTModify = (data) => {
      console.log("find NFTmodify event")
    
      const query = 'INSERT INTO public."ListedNFT" (collection_address, token_id, collateral_amount, max_rent_duration, rent_fee_per_block) VALUES($1,$2,$3,$4,$5) ON CONFLICT ' +
                    '(collection_address, token_id) DO UPDATE SET collateral_amount=$3, max_rent_duration=$4, rent_fee_per_block=$5'
      const contents = data.returnValues

      client
      .query(query, [contents.collection_address.toString(), parseInt(contents.token_id), parseInt(contents.input[1]), parseInt(contents.input[0]), parseInt(contents.input[2])])
      .then((res) => {
          console.log('MODIFIEDNFT UPSERT successfully!');
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

    const NFTrent = (data) => {
      console.log("find NFTrent event")
  
      const query =
      'INSERT INTO public."RentedNFT" (collection_address, token_id, renter_accounts, rent_block, rent_duration, rent_fee) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT ' +
      "(collection_address, token_id) DO UPDATE SET collection_address=$1, token_id=$2, renter_accounts=$3, rent_block=$4, rent_duration=$5, rent_fee=$6";
      const contents = data.returnValues

      client
      .query(query, [contents.collection_address.toString(), parseInt(contents.token_id), contents.from_address.toString(), parseInt(contents.rented_block), parseInt(contents.rent_duration), parseInt(contents.rent_fee)])
      .then((res) => {
          console.log('RENTED UPSERT successfully!');
      })
      .catch(err => console.log(err))
      .then(() => {
          console.log('Finished execution, exiting now');
      })
  }

    const Transaction = (data) => {
    console.log("find transaction event")

    const query =
    'INSERT INTO public."transaction" (tx_hash, collection_address, token_id, from_address, event, transaction_block) VALUES($1,$2,$3,$4,$5,$6)'
    const contents = data.returnValues

    client
    .query(query, [data.transactionHash ,contents.collection_address, parseInt(contents.token_id), contents.from_address, data.event, parseInt(data.blockNumber)])
    .then((res) => {
        console.log('INSERT transaction successfully!');
    })
    .catch(err => console.log(err))
    .then(() => {
        console.log('Finished execution, exiting now');
    })
}
    
    function queryDatabase(data) {
    
        if (data.event === "NFTlist") {
            NFTinfo(data)
            NFTlist(data)
        }
        if (data.event === "NFTlistcancel") {
            NFTcancel(data)
        }

        if (data.event === "NFTrented") {
            NFTrent(data)
        }

        if (data.event === "NFTlistmodified") {
          NFTModify(data)
        }

        Transaction(data)
    
  }
}


