'use strict';
module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    linkPrecedence: {
      type: DataTypes.ENUM('primary', 'secondary'),
      allowNull: false,
      defaultValue: 'secondary',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    timestamps: true,
    paranoid: true,
  });

  Contact.findPrimaryByEmail = async function(email) {
    // Find the contact by email
    const contact = await this.findOne({ where: { email } });
  
    if (!contact) return null; // Return null if contact with email doesn't exist
  
    if (contact.linkPrecedence === 'primary') {
      return contact; // Return the contact if it's already primary
    } else {
      // If contact exists but is not primary, fetch the primary contact by linkedId
      const primaryContact = await this.findOne({ where: { id: contact.linkedId, linkPrecedence: 'primary' } });
      return primaryContact;
    }
  };
  
  Contact.findPrimaryByPhoneNumber = async function(phoneNumber) {
    // Find the contact by phoneNumber
    const contact = await this.findOne({ where: { phoneNumber } });
  
    if (!contact) return null; // Return null if contact with phoneNumber doesn't exist
  
    if (contact.linkPrecedence === 'primary') {
      return contact; // Return the contact if it's already primary
    } else {
      // If contact exists but is not primary, fetch the primary contact by linkedId
      const primaryContact = await this.findOne({ where: { id: contact.linkedId, linkPrecedence: 'primary' } });
      return primaryContact;
    }
  };

  Contact.getLinkedContacts = async function(primaryContactId) {
    return this.findAll({
      where: { linkedId: primaryContactId }
    });
  };

  Contact.getLinkedContactIds = async function(primaryContactId) {
    const linkedContacts = await this.findAll({
      where: { linkedId: primaryContactId },
      attributes: ['id']
    });
    return linkedContacts.map(contact => contact.id); 
  };

  return Contact;
};
