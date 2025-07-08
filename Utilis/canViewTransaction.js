const canViewTransaction = ({ role, userId, bankId, branchId }, transaction) => {
    const txnUserId = transaction.userId;
    const txnBankId = transaction.account?.branch?.bankId;
    const txnBranchId = transaction.account?.branch?.id;

    if (role === 'admin') return true;
    if (role === 'bank_admin' && bankId === txnBankId) return true;
    if (['staff', 'bank_teller', 'customer_service'].includes(role) && branchId === txnBranchId) return true;
    if (userId === txnUserId) return true;

    return false;
};
