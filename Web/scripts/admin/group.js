class GroupManagement {
	constructor(options) {
		this.options = options;
		this.elements = this.initializeElements();
		this.activeId = null;
		this.allUserList = null;
	}

	initializeElements() {
		return {
			groupList: $('#groupList'),

			autocompleteSearch: $('#groupSearch'),
			userSearch: $('#userSearch'),

			groupUserList: $('#groupUserList'),
			membersDialog: $('#membersDialog'),
			allUsersList: $('#allUsersList'),
			permissionsDialog: $('#permissionsDialog'),
			deleteDialog: $('#deleteDialog'),
			editDialog: $('#editDialog'),
			browseUserDialog: $('#allUsers'),
			rolesDialog: $('#rolesDialog'),
			groupAdminDialog: $('#groupAdminDialog'),

			permissionsForm: $('#permissionsForm'),
			addUserForm: $('#addUserForm'),
			removeUserForm: $('#removeUserForm'),
			editGroupForm: $('#editGroupForm'),
			deleteGroupForm: $('#deleteGroupForm'),
			rolesForm: $('#rolesForm'),
			groupAdminForm: $('#groupAdminForm'),
			groupCount: $('#groupCount'),

			addForm: $('#addGroupForm'),
			addDialog: $('#addGroupDialog'),

			checkAllResourcesFull: $('#checkAllResourcesFull'),
			checkAllResourcesView: $('#checkAllResourcesView'),
			checkNoResources: $('#checkNoResources'),

			editGroupName: $('#editGroupName'),
			editGroupIsDefault: $('#editGroupIsDefault'),

			changeAdminGroupsForm: $('#groupAdminGroupsForm'),
			changeAdminResourcesForm: $('#resourceAdminForm'),
			changeAdminSchedulesForm: $('#scheduleAdminForm'),
			resourceAdminDialog: $('#resourceAdminDialog'),
			groupAdminAllDialog: $('#groupAdminAllDialog'),
			scheduleAdminDialog: $('#scheduleAdminDialog'),

			importGroupsDialog: $('#importGroupsDialog'),
			importGroupsForm: $('#importGroupsForm'),
			importGroupsTrigger: $('#import-groups')
		};
	}

	init() {
		this.bindEventListeners();
		this.configureAutocomplete();
		this.configureAsyncForms();
	}

	bindEventListeners() {
		const { groupList, groupUserList, browseUserDialog, addDialog, importGroupsDialog } = this.elements;

		//main interface
		$(".save").click((e) => $(e.currentTarget).closest("form").submit());
        $(".cancel").click((e) => $(e.currentTarget).closest(".modal").modal("hide"));
		

		$('#add-group').click((e) => {
			e.preventDefault();
			addDialog.modal('show');
			addDialog.find(':text').first().focus();
		});

		groupList.on('click', 'a.update', (e) => {
			e.preventDefault();
			this.setActiveId($(e.currentTarget));
		});

		groupList.on('click', '.rename', () => this.editGroup());
		groupList.on('click', '.permissions', () => this.changePermissions());
		groupList.on('click', '.members', () => this.changeMembers());
		groupList.on('click', '.groupAdmin', () => this.changeGroupAdmin());
		groupList.on('click', '.changeAdminGroups', () => this.changeAdminGroups());
		groupList.on('click', '.changeAdminResources', () => this.changeAdminResources());
		groupList.on('click', '.changeAdminSchedules', () => this.changeAdminSchedules());
		groupList.on('click', '.delete', () => this.deleteGroup());
		groupList.on('click', '.roles', () => this.changeRoles());

		//user selection for group
		groupUserList.on('click', '.delete', (e) => {
			const userId = $(e.currentTarget).siblings('.id').val();
			this.removeUserFromGroup($(e.currentTarget), userId);
		});


		browseUserDialog.on('click', '.add', (e) => {
			const link = $(e.currentTarget);
			const userId = link.siblings('.id').val();

			this.addUserToGroup(userId);

			link.find('i').removeClass('bi-plus-square-fill text-success').addClass('bi-check-circle-fill text-info');
		});

		$("#browseUsers").click(() => {
			this.showAllUsersToAdd();
		});

		//ressource selection
		this.elements.checkAllResourcesFull.click((e) => {
			e.preventDefault();
			this.elements.permissionsDialog.find('.full').prop('selected', true);
		});

		this.elements.checkAllResourcesView.click((e) => {
			e.preventDefault();
			this.elements.permissionsDialog.find('.view').prop('selected', true);
		});

		this.elements.checkNoResources.click((e) => {
			e.preventDefault();
			this.elements.permissionsDialog.find('.none').prop('selected', true);
		});

		//group role
		$('.adminDialog').on('click', '.checkbox', (e) => {
			const $checkbox = $(e.currentTarget);
			const modal = $checkbox.closest('.modal-body');
			modal.find('.count').text(modal.find(':checked').length);
		});

		//import group form
		importGroupsDialog.click((e) => {
			e.preventDefault();
			this.elements.importGroupsDialog.modal('show');
		});
	}

	configureAutocomplete() {
		const { autocompleteSearch, userSearch } = this.elements;
		autocompleteSearch.autocomplete({
			source: (request, response) => {
				$.ajax({
					url: this.options.groupAutocompleteUrl,
					dataType: "json",
					data: { term: request.term },
					success: (data) => {
						response(data.map((item) => ({ label: item.Name, value: item.Id })));
					}
				});
			},
			focus: (event, ui) => {
				autocompleteSearch.val(ui.item.label);
				return false;
			},
			select: (event, ui) => {
				autocompleteSearch.val(ui.item.label);
				window.location.href = `${this.options.selectGroupUrl}${ui.item.value}`;
				return false;
			}
		});

		userSearch.userAutoComplete(this.options.userAutocompleteUrl, (ui) => {
			this.addUserToGroup(ui.item.value);
			userSearch.val('');
		});
	}

	configureAsyncForms() {
		const {
			addUserForm,
			removeUserForm,
			permissionsForm,
			editGroupForm,
			deleteGroupForm,
			addForm,
			rolesForm,
			groupAdminForm,
			changeAdminGroupsForm,
			changeAdminResourcesForm,
			changeAdminSchedulesForm,
			importGroupsForm
		} = this.elements;

		ConfigureAsyncForm(addUserForm, this.getSubmitCallback(this.options.actions.addUser), this.changeMembers.bind(this));
		ConfigureAsyncForm(removeUserForm, this.getSubmitCallback(this.options.actions.removeUser), this.changeMembers.bind(this));
		ConfigureAsyncForm(permissionsForm, this.getSubmitCallback(this.options.actions.permissions), () => this.elements.permissionsDialog.modal('hide'));
		ConfigureAsyncForm(editGroupForm, this.getSubmitCallback(this.options.actions.updateGroup));
		ConfigureAsyncForm(deleteGroupForm, this.getSubmitCallback(this.options.actions.deleteGroup));
		ConfigureAsyncForm(addForm, this.getSubmitCallback(this.options.actions.addGroup));
		ConfigureAsyncForm(rolesForm, this.getSubmitCallback(this.options.actions.roles));
		ConfigureAsyncForm(groupAdminForm, this.getSubmitCallback(this.options.actions.groupAdmin));
		ConfigureAsyncForm(changeAdminGroupsForm, this.getSubmitCallback(this.options.actions.adminGroups), () => this.elements.groupAdminAllDialog.modal('hide'));
		ConfigureAsyncForm(changeAdminResourcesForm, this.getSubmitCallback(this.options.actions.resourceGroups), () => this.elements.resourceAdminDialog.modal('hide'));
		ConfigureAsyncForm(changeAdminSchedulesForm, this.getSubmitCallback(this.options.actions.scheduleGroups), () => this.elements.scheduleAdminDialog.modal('hide'));
		ConfigureAsyncForm(importGroupsForm, this.getSubmitCallback(this.options.actions.importGroups), this.importHandler.bind(this));
	}

	getSubmitCallback(action) {
		return () => `${this.options.submitUrl}?gid=${this.activeId}&action=${action}`;
	}

	setActiveId(button) {
		this.activeId = button.parents("tr").data("group-id");
		console.log(this.activeId);
	}

	//change group details
	editGroup() {
		const activeRow = this.elements.groupList.find(`[data-group-id="${this.activeId}"]`);
		this.elements.editGroupName.val(activeRow.find('.dataGroupName').text());
		this.elements.editGroupIsDefault.prop('checked', activeRow.data('group-default') === '1');
		this.elements.editDialog.modal('show');
	}

	deleteGroup() {
		this.elements.deleteDialog.modal('show');
	}

	//change group members
	changeMembers() {
		const groupId = this.activeId;
		$.getJSON(`${this.options.groupsUrl}?dr=groupMembers`, { gid: groupId }, (data) => {
			const items = [];
			const userIds = [];

			$('#totalUsers').text(data.Total);
			if (data.Users) {
				data.Users.forEach((item) => {
					items.push(`<div><a href="#" class="delete"><i class="bi bi-x-square-fill text-danger"></i></a> ${item.DisplayName}<input type="hidden" class="id" value="${item.Id}"/></div>`);
					userIds[item.Id] = item.Id;
				});
			}

			this.elements.groupUserList.empty();
			this.elements.groupUserList.data('userIds', userIds);

			$('<div/>', { html: items.join('') }).appendTo(this.elements.groupUserList);
		});
		this.elements.membersDialog.modal('show');
	}

	addUserToGroup(userId) {
		this.elements.addUserForm.find('#addUserId').val(userId);
		this.elements.addUserForm.submit();
	}

	removeUserFromGroup(element, userId) {
		this.elements.removeUserForm.find('#removeUserId').val(userId);
		this.elements.removeUserForm.submit();
	}

	showAllUsersToAdd() {
		this.elements.membersDialog.modal('hide');
		this.elements.allUsersList.empty();

		if (!this.allUserList) {
			$.ajax({
				url: this.options.userAutocompleteUrl,
				dataType: 'json',
				async: false,
				success: (data) => {
					this.allUserList = data;
				}
			});
		}

		const items = [];
		if (this.allUserList) {
			this.allUserList.forEach((item) => {
				if (!this.elements.groupUserList.data('userIds')[item.Id]) {
					items.push(`<div><a href="#" class="add"><i class="bi bi-plus-square-fill text-success"></i></a> ${item.DisplayName}<input type="hidden" class="id" value="${item.Id}"/></div>`);
				} else {
					items.push(`<div><i class="bi bi-check-circle-fill me-1 text-info"></i><span>${item.DisplayName}</span></div>`);
				}
			});
		}

		$('<div/>', { html: items.join('') }).appendTo(this.elements.allUsersList);
		this.elements.browseUserDialog.modal('show');
	}

	//change group ressource permission
	changePermissions() {
		const groupId = this.activeId;

		$.get(this.options.permissionsUrl, { dr: this.options.dataRequests.permissions, gid: groupId }, (permissions) => {
			this.elements.permissionsForm.find('.none').prop('selected', true);

			(permissions.full || []).forEach((id) => {
				this.elements.permissionsForm.find(`#permission_${id}`).val(`${id}_0`);
			});

			(permissions.view || []).forEach((id) => {
				this.elements.permissionsForm.find(`#permission_${id}`).val(`${id}_1`);
			});

			this.elements.permissionsDialog.modal('show');
		});
	}

	//change group admin
	changeGroupAdmin() {
		const activeRow = this.elements.groupList.find(`[data-group-id="${this.activeId}"]`);
		const currentGroupAdmin = activeRow.find('.groupAdmin').text();
		const currentGroupAdminVal = this.elements.groupAdminForm.find('select').find('option').filter(function () {
			return $(this).html() === currentGroupAdmin;
		}).val();

		this.elements.groupAdminForm.find('select').val(currentGroupAdminVal || '');
		this.elements.groupAdminDialog.modal('show');
	}

	//change group role
	changeRoles() {
		const groupId = this.activeId;

		$.get(this.options.rolesUrl, { dr: this.options.dataRequests.roles, gid: groupId }, (roleIds) => {
			this.elements.rolesForm.find(':checkbox').prop('checked', false);
			roleIds.forEach((value) => {
				this.elements.rolesForm.find(`:checkbox[value="${value}"]`).prop('checked', true);
			});

			this.elements.rolesDialog.modal('show');
		});
	}

	changeAdminGroups() {
		this.populateAdminCheckboxes(this.options.dataRequests.adminGroups, this.elements.changeAdminGroupsForm, this.elements.groupAdminAllDialog);
	}

	changeAdminResources() {
		this.populateAdminCheckboxes(this.options.dataRequests.resourceGroups, this.elements.changeAdminResourcesForm, this.elements.resourceAdminDialog);
	}

	changeAdminSchedules() {
		this.populateAdminCheckboxes(this.options.dataRequests.scheduleGroups, this.elements.changeAdminSchedulesForm, this.elements.scheduleAdminDialog);
	}

	populateAdminCheckboxes(dr, form, dialog) {
		const groupId = this.activeId;

		dialog.find('.count').text(dialog.find(':checked').length);

		$.get(this.options.submitUrl, { dr, gid: groupId }, (groupIds) => {
			form.find(':checkbox').prop('checked', false);
			groupIds.forEach((value) => {
				form.find(`:checkbox[value="${value}"]`).prop('checked', true);
			});

			dialog.find('.count').text(groupIds.length);
			dialog.modal('show');
		});
	}

	importHandler(response) {
		if (!response) return;

		$('#importCount').text(response.importCount);
		$('#importSkipped').text(response.skippedRows.length || '0');
		$('#importResult').removeClass('d-none');

		const errors = $('#importErrors');
		errors.empty();
		if (response.messages && response.messages.length > 0) {
			const messages = response.messages.join('</li><li>');
			errors.html(`<div>${messages}</div>`).removeClass('d-none');
		}
	}
}

export default GroupManagement;