const { User, Transaction, Loan, Bank, Account, Branch } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const usersCount = await User.count();
    const transactionsCount = await Transaction.count();
    const loansCount = await Loan.count();
    const banksCount = await Bank.count();
    const accountsCount = await Account.count();

    const chartData = [
      { month: 'Jan', total: 120 },
      { month: 'Feb', total: 150 },
      { month: 'Mar', total: 170 },
      { month: 'Apr', total: 200 },
      { month: 'May', total: 220 },
      { month: 'Jun', total: 250 },
    ];

    res.status(200).json({
      stats: {
        users: usersCount,
        transactions: transactionsCount,
        loans: loansCount,
        banks: banksCount,
        accounts: accountsCount,
      },
      chartData,
      user: req.user // If your auth middleware adds user to req
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

exports.getBankStats = async (req, res) => {
  try {
    const userRoles = req.roles;
    const userId = req.user.id;
    let bankId;

    if (userRoles.includes("admin")) {
      bankId = req.query.bankId;
      if (!bankId) {
        return res.status(400).json({ message: "Bank ID is required for admin" });
      }
    } else if (userRoles.includes("bank_admin")) {
      bankId = req.user.bankId;
      if (!bankId) {
        return res.status(400).json({ message: "Bank ID missing from admin account." });
      }
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const bank = await Bank.findByPk(bankId);
    if (!bank) return res.status(404).json({ message: "Bank not found" });

    // Fetch all branches
    const branches = await Branch.findAll({ where: { bankId } });

    // Fetch account count and transaction count per branch
    const branchStats = await Promise.all(
      branches.map(async (branch) => {
        const accountCount = await Account.count({ where: { branchId: branch.id } });

        const branchAccounts = await Account.findAll({
          where: { branchId: branch.id },
          attributes: ["id"]
        });
        const accountIds = branchAccounts.map(acc => acc.id);

        const transactionCount = await Transaction.count({
          where: { accountId: accountIds }
        });

        return {
          id: branch.id,
          name: branch.name,
          accounts: accountCount,
          transactions: transactionCount
        };
      })
    );

    const stats = {
      totalBranches: branches.length,
      totalAccounts: await Account.count({ where: { bankId } }),
      totalTransactions: await Transaction.count({
        where: {
          accountId: await Account.findAll({
            where: { bankId },
            attributes: ['id']
          }).then(accs => accs.map(a => a.id))
        }
      })
    };

    return res.json({
      bank,
      stats,
      topBranches: branchStats.sort((a, b) => b.transactions - a.transactions).slice(0, 5),
      branches: branchStats, // ✅ full list for table
      chartData: [], // add later
      recentActivity: [] // optional
    });

  } catch (err) {
    console.error("❌ getBankStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


