const TransactionPool = require('./transaction-pool')
const Wallet = require('./index')

describe('TransactionPool', () => {
  let wallet, tp, transaction
  beforeEach(() => {
    wallet = new Wallet()
    tp = new TransactionPool()
    transaction = wallet.createTransaction('r4nd-4dr355', 30, tp)
  })

  it('adds a transaction to the pool', () => {
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction)
  })

  it('updates a transaction in the pool', () => {
    const oldTransaction = JSON.stringify(transaction)
    const newTransaction = transaction.update(wallet, 'foo-4ddr355', 40)
    tp.upsert(newTransaction)
    expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction)
  })

  it('clears transactions', () => {
    tp.clear()
    expect(tp.transactions).toEqual([])
  })

  describe('mixing valid and corrupted transactions', () => {
    let validTransactions
    beforeEach(() => {
      validTransactions = [...tp.transactions]
      for (let i=0; i<6; i++) {
        wallet = new Wallet()
        transaction = wallet.createTransaction('r4nd-4dr355', 30, tp)
        if (i % 2 == 0) {
          transaction.input.amount = 99999
        } else {
          validTransactions.push(transaction)
        }
      }
    })
    it('shows a difference between valid and corrupted transactions', () => {
      expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions))
    })
    it('grabs valid transactions', () => {
      expect(tp.validTransactions()).toEqual(validTransactions)
    })
  })
})

