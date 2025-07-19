// smp-sdk-ts/src/api/graphql/queries/invoiceQueries.js

const invoiceQueries = {
    // QUERY TO GET AN INVOICE BY ITS UNIQUE ID
    GET_INVOICE_BY_ID: `
      query GetInvoice($invoiceId: String!) {
        invoice(invoiceId: $invoiceId) {
          invoiceId
          uniqRef
          transactionId
          slug
          orderId
          thirdPartyFees
          servicesFees
          servicesVatPercent
          prestationsVatPercent
          totalAmount
          sellerOrganizationId
          paymentStatus
          emittedDate
          dueDate
          digitalSignature
          state
          createdAt
          updatedAt
          deletedAt
          transactionData
          notes
          disclaimers
          paymentTerms
          profile
          header {
            id
            invoiceNumber
            name
            invoiceDate
            issueDate
            typeCode
            notes {
              heading
              note
            }
          }
          seller {
            name
            postalAddress {
              line1
              city
              postalCode
              countryCode
              line2
            }
            vatNumber
            contacts {
              contactName
              contactEmail
              contactPhoneNumber
              divisionName
            }
          }
          buyer {
            name
            postalAddress {
              line1
              city
              postalCode
              countryCode
              line2
            }
            vatNumber
            contacts {
              contactName
              contactEmail
              contactPhoneNumber
              divisionName
            }
          }
          payment {
            paymentMeansCode
            payeeIBAN
            payeeBIC
            dueDate
            paymentTermsText
          }
          lines {
            id
            description
            quantity
            unitPrice
            vatRate
            taxCategoryCode
            unitCode
            allowances
            charges {
              chargeIndicator
              actualAmount
              reason
              reasonCode
              taxRate
              taxCategoryCode
              startDate
              endDate
              percentage
            }
          }
          deliveryParty {
            name
            postalAddress {
              line1
              city
              postalCode
              countryCode
              line2
            }
            vatNumber
            contacts {
              contactName
              contactEmail
              contactPhoneNumber
              divisionName
            }
          }
          payeeParty {
            name
            postalAddress {
              line1
              city
              postalCode
              countryCode
              line2
            }
            vatNumber
            contacts {
              contactName
              contactEmail
              contactPhoneNumber
              divisionName
            }
          }
          buyerOrganizationId
          additionalDocuments {
            documentTypeCode
            id
            name
            attachmentPath
          }
          docAllowanceCharges {
            chargeIndicator
            actualAmount
            reason
            reasonCode
            taxRate
            taxCategoryCode
            startDate
            endDate
            percentage
          }
          currency
          taxTotals {
            taxCategory
            taxRate
            taxableAmount
            taxAmount
          }
        }
      }
    `,
  
    // QUERY TO GET MULTIPLE INVOICES BY AN ARRAY OF INVOICE IDS
    GET_INVOICES_BY_IDS: `
      query GetInvoicesByIDs($invoiceIDs: [ID!]!) {
        invoicesByIDs(invoiceIDs: $invoiceIDs) {
          invoiceID
          uniqRef
          slug
          estimateID
          thirdPartyFees
          servicesFees
          servicesVatPercent
          prestationsVatPercent
          totalAmount
          paymentStatus
          emitDate
          dueDate
          digitalSignature
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET AN INVOICE BY ITS UNIQUE REFERENCE
    GET_INVOICE_BY_UNIQ_REF: `
      query GetInvoiceByUniqRef($uniqRef: String!) {
        invoiceByUniqRef(uniqRef: $uniqRef) {
          invoiceID
          uniqRef
          slug
          estimateID
          thirdPartyFees
          servicesFees
          servicesVatPercent
          prestationsVatPercent
          totalAmount
          paymentStatus
          emitDate
          dueDate
          digitalSignature
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET AN INVOICE BY ITS SLUG
    GET_INVOICE_BY_SLUG: `
      query GetInvoiceBySlug($slug: String!) {
        invoiceBySlug(slug: $slug) {
          invoiceID
          uniqRef
          slug
          estimateID
          thirdPartyFees
          servicesFees
          servicesVatPercent
          prestationsVatPercent
          totalAmount
          paymentStatus
          emitDate
          dueDate
          digitalSignature
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET MULTIPLE INVOICES BY SLUGS
    GET_INVOICES_BY_SLUGS: `
      query GetInvoicesBySlugs($slugs: [String!]!) {
        invoicesBySlugs(slugs: $slugs) {
          invoiceID
          uniqRef
          slug
          estimateID
          thirdPartyFees
          servicesFees
          servicesVatPercent
          prestationsVatPercent
          totalAmount
          paymentStatus
          emitDate
          dueDate
          digitalSignature
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO LIST INVOICES WITH OPTIONAL PAGINATION, SORTING, AND FILTERING
    GET_INVOICES: `
      query GetInvoices {
        invoices {
          invoiceId
          uniqRef
          transactionId
          slug
          orderId
          thirdPartyFees
          servicesFees
          servicesVatPercent
          prestationsVatPercent
          totalAmount
          sellerOrganizationId
          paymentStatus
          emittedDate
          dueDate
          digitalSignature
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO CREATE AN INVOICE
    CREATE_INVOICE: `
      mutation CreateInvoice($input: CreateInvoiceInput!) {
        createInvoice(input: $input) {
          invoiceId
          uniqRef
          transactionId
          slug
          orderId
          thirdPartyFees
          servicesFees
          servicesVatPercent
          prestationsVatPercent
          totalAmount
          sellerOrganizationId
          paymentStatus
          emittedDate
          dueDate
          digitalSignature
          state
          createdAt
          updatedAt
        }
      }
    `
  };
  
  export { invoiceQueries };
  