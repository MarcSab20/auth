import pkg from 'lodash';
const { differenceWith, isEqual } = pkg;

async function checkGraphQLService(name, url) {
  try {
    // Requête introspective GraphQL pour obtenir le schéma
    const query = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.error(`Service ${name} at ${url} is not available. Status: ${response.status}`);
      return null;
    }

    const { data, errors } = await response.json();
    if (errors || !data) {
      console.error(`Service ${name} at ${url} returned errors or no data.`);
      return null;
    }

    // Si la réponse contient un schéma valide
    if (data.__schema) {
      return { name, url };
    } else {
      console.error(`Service ${name} at ${url} does not return a valid schema.`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch service ${name} at ${url}:`, error);
    return null;
  }
};

async function reacheableServices(serviceListing) {
  const services = serviceListing.split(';').map(service => {
    const [name, url] = service.split(',');
    if (!name || !url) {
      console.error(`Service definition error: ${service}`);
      return null;
    }
    return { name: name.trim(), url: url.trim() };
  }).filter(service => service !== null);

  const avalaibleServices = [];
  for (const service of services) {
    const result = await checkGraphQLService(service.name, service.url);
    if (result) {
      console.log(service.name.trim(), ": ", service.url.trim(), "Add for federated.....");
      avalaibleServices.push(result);
    } else {
    }
  }

  function differenceWithLodash(arr1, arr2) {
    return differenceWith(arr1, arr2, isEqual).concat(differenceWith(arr2, arr1, isEqual));
  }
  const unavailableServices = differenceWithLodash(services, avalaibleServices);

  return { avalaibleServices, unavailableServices } ;
};

export { reacheableServices }