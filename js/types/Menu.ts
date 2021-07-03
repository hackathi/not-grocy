export interface MenuItemClickEvent { originalEvent: Event, item: MenuItem }
export interface MenuItem {
	label: string,
	icon?: string,
	to?: string,
	items?: Array<MenuItem>,
	visible?: (boolean | (() => boolean)),
	disabled?: boolean,
	url?: string,
	command?: ((arg0: MenuItemClickEvent) => null),
}