import ButtonLink from "ethereum-org-website/src/components/ButtonLink"
import Modal from "ethereum-org-website/src/components/Modal"
import Link from "ethereum-org-website/src/components/Link"
import {
  ButtonPrimary,
  ButtonSecondary,
  H2,
} from "ethereum-org-website/src/components/SharedStyledComponents"
import { capitalize } from "lodash"
import React, { useState, useEffect } from "react"
import { ETHERSCAN_ENDPOINT, FAUCET_LINK, TESTNET_NAME } from "../config"
import { useAccount, useWeb3 } from "../hooks"

interface AccountButtonProps
  extends React.ComponentProps<typeof ButtonPrimary> {}

const AccountButton: React.FC<AccountButtonProps> = props => {
  const { web3, transactionPendingObserver } = useWeb3()
  const { account, loading, balance, refetchBalance } = useAccount()
  const [accountModalIsOpen, setAccountModalIsOpen] = useState(false)
  const [isTransactionPending, setIsTransactionPending] = useState(false)
  const address = account?.address
  useEffect(() => {
    transactionPendingObserver.subscribe(
      "accountButton",
      isTransactionPending => {
        setIsTransactionPending(isTransactionPending)
      }
    )
    return () => {
      transactionPendingObserver.unsubscribe("accountButton")
    }
  })

  return (
    <>
      <ButtonPrimary onClick={() => setAccountModalIsOpen(true)} {...props}>
        {loading
          ? "Connecting..."
          : isTransactionPending
          ? "Transaction in Queue"
          : "Connected to Blockchain"}
      </ButtonPrimary>
      {/* Just hide the entire element when not open. Overlay is causing z-index issues */}
      {accountModalIsOpen && (
        <Modal isOpen={accountModalIsOpen} setIsOpen={setAccountModalIsOpen}>
          <H2 style={{ marginTop: 0 }}>Account Info</H2>
          <p>
            We've created an account for you on the{" "}
            <b>{capitalize(TESTNET_NAME)}</b> network.
          </p>
          {TESTNET_NAME !== "mainnet" && (
            <p>
              The {capitalize(TESTNET_NAME)} network is an Ethereum{" "}
              <b>testnet</b>, meaning your ETH has no real value. The network is
              just used for testing.
            </p>
          )}
          <p>
            Your address is <b>{address}</b>.
          </p>
          <p>
            Your balance is <b>{web3?.utils.fromWei(balance) ?? 0} ETH</b>.
          </p>
          {parseInt(balance) < 5e16 /* < 0.05 ETH */ && (
            <p>
              Since your balance is <b>{balance === '0' ? '0' : 'less than 0.05'} ETH</b>, {balance === 0 ? 'you first need to get some ETH' : 'you\'ll probably want to get some more ETH'} <Link to={FAUCET_LINK}>here</Link>.
            </p>
          )}
          <div>
            <ButtonLink to={`${ETHERSCAN_ENDPOINT}/address/${address}`}>
              View Details on Etherscan
            </ButtonLink>
            <ButtonSecondary
              onClick={refetchBalance}
              disabled={loading}
              style={{ marginLeft: "1rem" }}
            >
              Refresh Balance
            </ButtonSecondary>
          </div>
        </Modal>
      )}
    </>
  )
}

export { AccountButton }
