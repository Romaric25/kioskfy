export interface IBetterAuthFields {
  phone: {
    type: "string";
    required: true;
  };
  lastName: {
    type: "string";
    required: true;
  };
  role: {
    type: "string";
    required: false;
  };
  address: {
    type: "string";
    required: false;
  };
  active: {
    type: "boolean";
    required: false;
  };
  typeUser: {
    type: "string";
    required: false;
  };
}

export const betterAuthFields = {
  user: {
    phone: {
      type: "string" as const,
      required: true,
    },
    lastName: {
      type: "string" as const,
      required: true,
    },
    role: {
      type: "string" as const,
      required: false,
    },
    address: {
      type: "string" as const,
      required: false,
    },
    active: {
      type: "boolean" as const,
      required: false,
    },
    typeUser: {
      type: "string" as const,
      required: false,
    },
  },
} satisfies { user: IBetterAuthFields };
