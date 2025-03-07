/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onCreateUser(filter: $filter, owner: $owner) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onUpdateUser(filter: $filter, owner: $owner) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onDeleteUser(filter: $filter, owner: $owner) {
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
export const onCreateUserImage = /* GraphQL */ `
  subscription OnCreateUserImage(
    $filter: ModelSubscriptionUserImageFilterInput
    $owner: String
  ) {
    onCreateUserImage(filter: $filter, owner: $owner) {
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
export const onUpdateUserImage = /* GraphQL */ `
  subscription OnUpdateUserImage(
    $filter: ModelSubscriptionUserImageFilterInput
    $owner: String
  ) {
    onUpdateUserImage(filter: $filter, owner: $owner) {
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
export const onDeleteUserImage = /* GraphQL */ `
  subscription OnDeleteUserImage(
    $filter: ModelSubscriptionUserImageFilterInput
    $owner: String
  ) {
    onDeleteUserImage(filter: $filter, owner: $owner) {
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
export const onCreateApparel = /* GraphQL */ `
  subscription OnCreateApparel(
    $filter: ModelSubscriptionApparelFilterInput
    $owner: String
  ) {
    onCreateApparel(filter: $filter, owner: $owner) {
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
export const onUpdateApparel = /* GraphQL */ `
  subscription OnUpdateApparel(
    $filter: ModelSubscriptionApparelFilterInput
    $owner: String
  ) {
    onUpdateApparel(filter: $filter, owner: $owner) {
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
export const onDeleteApparel = /* GraphQL */ `
  subscription OnDeleteApparel(
    $filter: ModelSubscriptionApparelFilterInput
    $owner: String
  ) {
    onDeleteApparel(filter: $filter, owner: $owner) {
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
export const onCreateGeneratedImage = /* GraphQL */ `
  subscription OnCreateGeneratedImage(
    $filter: ModelSubscriptionGeneratedImageFilterInput
    $owner: String
  ) {
    onCreateGeneratedImage(filter: $filter, owner: $owner) {
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
export const onUpdateGeneratedImage = /* GraphQL */ `
  subscription OnUpdateGeneratedImage(
    $filter: ModelSubscriptionGeneratedImageFilterInput
    $owner: String
  ) {
    onUpdateGeneratedImage(filter: $filter, owner: $owner) {
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
export const onDeleteGeneratedImage = /* GraphQL */ `
  subscription OnDeleteGeneratedImage(
    $filter: ModelSubscriptionGeneratedImageFilterInput
    $owner: String
  ) {
    onDeleteGeneratedImage(filter: $filter, owner: $owner) {
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
