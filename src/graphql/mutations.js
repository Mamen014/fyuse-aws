/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      name
      email
      images {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      name
      email
      images {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      name
      email
      images {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const createUserImage = /* GraphQL */ `
  mutation CreateUserImage(
    $input: CreateUserImageInput!
    $condition: ModelUserImageConditionInput
  ) {
    createUserImage(input: $input, condition: $condition) {
      id
      url
      bodyShape
      skinTone
      user {
        id
        name
        email
        createdAt
        updatedAt
        owner
        __typename
      }
      generatedImages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      userImagesId
      owner
      __typename
    }
  }
`;
export const updateUserImage = /* GraphQL */ `
  mutation UpdateUserImage(
    $input: UpdateUserImageInput!
    $condition: ModelUserImageConditionInput
  ) {
    updateUserImage(input: $input, condition: $condition) {
      id
      url
      bodyShape
      skinTone
      user {
        id
        name
        email
        createdAt
        updatedAt
        owner
        __typename
      }
      generatedImages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      userImagesId
      owner
      __typename
    }
  }
`;
export const deleteUserImage = /* GraphQL */ `
  mutation DeleteUserImage(
    $input: DeleteUserImageInput!
    $condition: ModelUserImageConditionInput
  ) {
    deleteUserImage(input: $input, condition: $condition) {
      id
      url
      bodyShape
      skinTone
      user {
        id
        name
        email
        createdAt
        updatedAt
        owner
        __typename
      }
      generatedImages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      userImagesId
      owner
      __typename
    }
  }
`;
export const createApparel = /* GraphQL */ `
  mutation CreateApparel(
    $input: CreateApparelInput!
    $condition: ModelApparelConditionInput
  ) {
    createApparel(input: $input, condition: $condition) {
      id
      name
      category
      imageUrl
      generatedImages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const updateApparel = /* GraphQL */ `
  mutation UpdateApparel(
    $input: UpdateApparelInput!
    $condition: ModelApparelConditionInput
  ) {
    updateApparel(input: $input, condition: $condition) {
      id
      name
      category
      imageUrl
      generatedImages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteApparel = /* GraphQL */ `
  mutation DeleteApparel(
    $input: DeleteApparelInput!
    $condition: ModelApparelConditionInput
  ) {
    deleteApparel(input: $input, condition: $condition) {
      id
      name
      category
      imageUrl
      generatedImages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const createGeneratedImage = /* GraphQL */ `
  mutation CreateGeneratedImage(
    $input: CreateGeneratedImageInput!
    $condition: ModelGeneratedImageConditionInput
  ) {
    createGeneratedImage(input: $input, condition: $condition) {
      id
      userImage {
        id
        url
        bodyShape
        skinTone
        createdAt
        updatedAt
        userImagesId
        owner
        __typename
      }
      apparel {
        id
        name
        category
        imageUrl
        createdAt
        updatedAt
        owner
        __typename
      }
      generatedUrl
      createdAt
      updatedAt
      userImageGeneratedImagesId
      apparelGeneratedImagesId
      owner
      __typename
    }
  }
`;
export const updateGeneratedImage = /* GraphQL */ `
  mutation UpdateGeneratedImage(
    $input: UpdateGeneratedImageInput!
    $condition: ModelGeneratedImageConditionInput
  ) {
    updateGeneratedImage(input: $input, condition: $condition) {
      id
      userImage {
        id
        url
        bodyShape
        skinTone
        createdAt
        updatedAt
        userImagesId
        owner
        __typename
      }
      apparel {
        id
        name
        category
        imageUrl
        createdAt
        updatedAt
        owner
        __typename
      }
      generatedUrl
      createdAt
      updatedAt
      userImageGeneratedImagesId
      apparelGeneratedImagesId
      owner
      __typename
    }
  }
`;
export const deleteGeneratedImage = /* GraphQL */ `
  mutation DeleteGeneratedImage(
    $input: DeleteGeneratedImageInput!
    $condition: ModelGeneratedImageConditionInput
  ) {
    deleteGeneratedImage(input: $input, condition: $condition) {
      id
      userImage {
        id
        url
        bodyShape
        skinTone
        createdAt
        updatedAt
        userImagesId
        owner
        __typename
      }
      apparel {
        id
        name
        category
        imageUrl
        createdAt
        updatedAt
        owner
        __typename
      }
      generatedUrl
      createdAt
      updatedAt
      userImageGeneratedImagesId
      apparelGeneratedImagesId
      owner
      __typename
    }
  }
`;
