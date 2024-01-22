// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

// avalanche router 0xF694E193200268f9a4868e4Aa017A0118C9a8177

contract KiteSender is OwnerIsCreator {
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error NothingToWithdraw();

    LinkTokenInterface private s_linkToken;
    IRouterClient private s_router;
    address private s_receiver;
    uint64 private s_destinationChainSelector = 16015286601757825753;

    constructor(
        address _link,
        address _router,
        address _receiver
    ) {
        s_linkToken = LinkTokenInterface(_link);
        s_router = IRouterClient(_router);
        s_receiver = _receiver;
    }

    enum PaymentInterval {
        Daily,
        Weekly,
        Monthly
    }

    struct CreateCampaignParams {
        uint256 interestRate;
        address vaultAddress;
        PaymentInterval paymentInterval;
        uint256 splitsCount;
        address sender;
    }


    function createCampaign(
        uint256 _interestRate,
        address _vaultAddress,
        PaymentInterval _paymentInterval,
        uint256 _splitsCount
    ) external returns (uint256 fees, bytes32 messageId) {
        Client.EVM2AnyMessage memory evm2AnyMessage;

        CreateCampaignParams memory params = CreateCampaignParams({
            interestRate: _interestRate,
            vaultAddress: _vaultAddress,
            paymentInterval: _paymentInterval,
            splitsCount: _splitsCount,
            sender: msg.sender
        });

        evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(s_receiver),
            data: abi.encode(params),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 1_000_000})
            ),
            feeToken: address(s_linkToken)
        });

        fees = s_router.getFee(s_destinationChainSelector, evm2AnyMessage);

        s_linkToken.approve(address(s_router), fees);
        if (fees > s_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

        messageId = s_router.ccipSend(
            s_destinationChainSelector,
            evm2AnyMessage
        );

        return (fees, messageId);
    }

}
