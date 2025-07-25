const estimates = [
  {
    id: "1", // ID sous forme de chaîne
    uniqRef: "DEV-001",
    clientName: "Alex Curren",
    subTotal: 8800, // Nombre
    tax: 1760, // Nombre
    total: 10560, // Nombre
    items: [
      {
        id: 1, // Nombre
        title: "Logo redesign",
        description: "New logo design",
        quantity: 2, // Nombre
        unitPrice: 1000, // Nombre
        total: 2000, // Nombre
      },
    ],
    negotiable: true,
    stage: "Negotiation",
    dueDate: "2023-04-15",
    from: {
      name: "Acme, Inc.",
      address: "123 Business Road, Cityville, Country",
      email: "contact@acme.com",
      phone: "+123 456 7890",
    },
    to: {
      name: "Alex Curren",
      address: "456 Client Street, Townsville, Region",
    },
  },
];

export default estimates;