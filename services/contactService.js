const { Contact } = require('../models');
const { Op } = require('sequelize');

async function identify({ email, phoneNumber }) {
  const primaryByEmail = email ? await Contact.findPrimaryByEmail(email) : null;
  const primaryByPhoneNumber = phoneNumber ? await Contact.findPrimaryByPhoneNumber(phoneNumber) : null;

  if (primaryByEmail && primaryByPhoneNumber && primaryByEmail.id === primaryByPhoneNumber.id) {
    // I1 == I2: return the primary contact details
    const linkedContacts = await Contact.getLinkedContacts(primaryByEmail.id);
    return formatResponse(primaryByEmail, linkedContacts);
  }

  if (primaryByEmail && !primaryByPhoneNumber) {
    // I1 exists but not I2: link new contact to I1
    if (phoneNumber === null || phoneNumber === "") {
      const linkedContacts = await Contact.getLinkedContacts(primaryByEmail.id);
      return formatResponse(primaryByEmail, linkedContacts);
    }

    await Contact.create({
      email,
      phoneNumber,
      linkedId: primaryByEmail.id,
      linkPrecedence: 'secondary'
    });

    const linkedContacts = await Contact.getLinkedContacts(primaryByEmail.id);
    return formatResponse(primaryByEmail, linkedContacts);
  }

  if (!primaryByEmail && primaryByPhoneNumber) {
    // I2 exists but not I1
    if (email === null || email === "") {
      const linkedContacts = await Contact.getLinkedContacts(primaryByPhoneNumber.id);
      return formatResponse(primaryByPhoneNumber, linkedContacts);
    }

    await Contact.create({
      email,
      phoneNumber,
      linkedId: primaryByPhoneNumber.id,
      linkPrecedence: 'secondary'
    });

    const linkedContacts = await Contact.getLinkedContacts(primaryByPhoneNumber.id);
    return formatResponse(primaryByPhoneNumber, linkedContacts);
  }

  if (primaryByEmail && primaryByPhoneNumber) {
    // Both I1 and I2 exist: reconcile identities
    const olderPrimary = primaryByEmail.createdAt < primaryByPhoneNumber.createdAt ? primaryByEmail : primaryByPhoneNumber;
    const newerPrimary = olderPrimary.id === primaryByEmail.id ? primaryByPhoneNumber : primaryByEmail;

    ids = [ newerPrimary.id ]
    linkedIds = await Contact.getLinkedContactIds(newerPrimary.id)
    ids = ids.concat(linkedIds)
  
    await Contact.update(
      { linkedId: olderPrimary.id, linkPrecedence: 'secondary' },
      { where: {id: ids } }
    );

    const linkedContacts = await Contact.getLinkedContacts(olderPrimary.id);
    return formatResponse(olderPrimary, linkedContacts);
  }

  // Neither exists: create a new primary contact
  const newPrimaryContact = await Contact.create({
    email,
    phoneNumber,
    linkPrecedence: 'primary'
  });

  return formatResponse(newPrimaryContact, []);
}

function formatResponse(primaryContact, linkedContacts) {
  const emails = [primaryContact.email].concat(linkedContacts.map(c => c.email)).filter(Boolean);
  const phoneNumbers = [primaryContact.phoneNumber].concat(linkedContacts.map(c => c.phoneNumber)).filter(Boolean);

  const distinctEmails = [...new Set(emails)];
  const distinctPhoneNumbers = [...new Set(phoneNumbers)];

  const secondaryContactIds = linkedContacts.map(c => c.id);

  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails: distinctEmails,
      phoneNumbers: distinctPhoneNumbers,
      secondaryContactIds
    }
  };
}


module.exports = { identify };
