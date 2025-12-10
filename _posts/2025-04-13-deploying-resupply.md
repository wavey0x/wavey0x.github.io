# Deploying Resupply Finance ... from a multisig

I’ll go out on a limb and say that Resupply Finance was the first major DeFi protocol deployed entirely from a Safe multisig. Surely I will be corrected on X if I’m wrong about that.

But given Resupply’s origin as a partnership between Yearn and Convex, deploying through a multisig made sense. It gave us joint custody over the deployer account, and serves as a strong root of trust for our deterministic multi-chain contract deployments.

This post is a technical walk-through of:

- Why we chose this setup
- The scripts and tools we used
- Why it motivated me to build a custom CLI tool, safesmith, to make it a little easier for whoever comes next

## Deployment requirements

- We are certainly not the first protocol to deploy key contracts using CREATE3,

## CREATE3 and Deterministic Contract Addresses

With Resupply, we want to deploy our tokens and core governance contracts across multiple networks (Ethereum mainnet, Fraxtal, etc) while having the token contract appear at the same exact address on each chain—even if the contract code must differ slightly. CREATE3 allows you achieve exactly that.

**CREATE3** is a deployment pattern for smart contracts that gives developers predictable contract addresses across multiple evm networks independent of the deployer address and the deployed code.

Unlike the built-in EVM opcodes (`CREATE` and `CREATE2`), **CREATE3** isn't actually a formal opcode. Instead, it is a simple pattern that cleverly combines both into a single deployment sequence. First deploy a throw-away factory using CREATE2 utilizing a custom salt, and then use the factory to deploy your final contract using CREATE which computes your contract address based on nonce not bytecode. You can pre-calculate the final result address - and even crunch salts to generate vanity addresses - by accounting for the different calculation formulas at each hop.

If this sounds complicated, you're in luck! The [CreateX](https://github.com/pcaversaccio/createx) smart contract is an extremely useful tool that takes care of the complexity for you. It allows you to deploy CREATE3 with a single call, and even allows you to specify some settings like permissioned deployments based on deployer and/or chain. Also check the [CreateX Crunch](https://github.com/HrikB/createXcrunch) repo to quickly crunch vanity addresses for you CreateX deployments.

## Deploying From a Safe

We didn’t deploy by hitting forge script --broadcast. We queued each deployment transaction to the Gnosis Safe Transaction Service API. This allowed:

- Review by both Yearn and Convex signers
- Staging multiple deployment steps in one place
- Keeping full transparency via Safe’s UI

That also meant writing Foundry scripts that output calldata and bytecode, rather than actually executing transactions.

## Example: Script with CREATE3

Here’s a simplified example of what a deployment step looked like in Foundry:

// scripts/DeployToken.s.sol
contract DeployToken is Script {
function run() external {
bytes memory bytecode = abi.encodePacked(
type(MyToken).creationCode,
abi.encode("Resupply Token", "RSUP")
);

        address deployed = create3.deploy(
            keccak256("RSUP_TOKEN"), // salt
            bytecode
        );

        console.log("Deployed Token at", deployed);
    }

}

But instead of calling deploy() directly on-chain, we’d: 1. Generate the calldata for deploy() 2. POST it to the Safe API 3. Wait for signers to approve + execute

This let us split deployments across multiple steps, all permissioned and tracked through Safe.

⸻

⚙️ Writing Custom Deploy Scripts… Was Not That Fun

Turns out, writing many Foundry scripts that needed to:
• Pull verified contracts from Etherscan
• Inject interfaces
• Track calldata / address determinism
• Bundle up transactions for the Safe

…was tedious and error-prone. So I wrote a Python tool to help.

⸻

🛠 Meet safesmith

safesmith is a small Python CLI tool I wrote to wrap around Foundry scripts and simplify the process of building and queuing Safe transactions.

What It Does:
• Parses custom directives in Solidity like:

// @inject IERC20 0xdAC17F958D2ee523a2206206994597C13D831ec7

Which gets replaced with a verified interface from Etherscan at that address.

    •	Lets you write clean, simple scripts without cluttering your repo with ABI files.
    •	Generates and queues the calldata to your Safe using the Gnosis Transaction Service API.
    •	Handles script templating, contract verification, calldata encoding, and transaction previewing.

Why I Built It

Because I didn’t want to:
• Copy/paste ABIs or manually verify interfaces
• Manually compute calldata
• Worry about address consistency or ordering issues

Demo

Here’s a basic example:

safesmith run scripts/DeployToken.s.sol --safe wavey3 --preview

This:
• Injects interfaces
• Parses and rewrites the script
• Compiles + extracts calldata
• Outputs a preview of the queued transaction before posting to the Safe API

You can also dry-run, sign locally, or commit queued actions to your own CI flow.

⸻

🧭 What I’d Do Differently
• Automate the gas estimation and nonce management more cleanly
• Use more standardized tooling for Safe queuing if it gets better in the future
• Probably ship a simplified deploy manager for others using CREATE3

But overall, this setup gave us confidence, auditability, and control — especially for a protocol like Resupply with multiple teams involved.

⸻

🧩 Wrapping Up

Deploying a DeFi protocol from a multisig using CREATE3 and custom scripting was… not the easiest way. But it was a deliberate choice that made us feel more confident and transparent.

And it led to safesmith, which I hope becomes a helpful tool for others deploying in structured, collaborative environments.

If you want to try safesmith, here’s the repo (coming soon), and I’d love feedback or contributors.

⸻

Let me know if you’d like help turning this into a markdown post, adding code gists, or pushing to a blog platform like Mirror or Paragraph!
