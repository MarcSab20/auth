// mocks/mockUsers.ts

export interface User {
    name: string;
    title: string;
    department: string;
    email: string;
    role: number;
    status: 'Pending' | 'Active' | 'Inactive' | string;
        image: string;
    lastname: string;
    userID: string;
    username: string;
  }
  
  export const mockUsers: User[] = [
    {
      name: 'Lindsay Walton',
      title: 'Front-end Developer',
      department: 'Development',
      email: 'lindsay.walton@example.com',
      role: 1,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastname: "",
      userID: "",
      username: ""
    },
  
  ];