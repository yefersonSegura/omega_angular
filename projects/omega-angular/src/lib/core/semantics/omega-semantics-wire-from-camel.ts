/**
 * camelCase enum member → dotted lower wire (`ordersCreate` → `orders.create`).
 * Omega dotted wire names from camelCase enum members (e.g. ordersCreate → orders.create).
 */
export function omegaWireNameFromCamelCaseEnumMember(enumMemberName: string): string {
  if (!enumMemberName) {
    return enumMemberName;
  }
  const dotted = enumMemberName.replaceAll(/([a-z0-9])([A-Z])/g, '$1.$2');
  return dotted.toLowerCase();
}
