class BlackoutManagement {
	constructor(options) {
		this.options = options;
		this.elements = this.initializeElements();
		this.activeId = null;
	}

	initializeElements() {
		return {
			startDate: $("#formattedStartDate"),
			endDate: $("#formattedEndDate"),
			scheduleId: $("#scheduleId"),
			resourceId: $("#resourceId"),
			blackoutTable: $("#blackoutTable"),

			allResources: $("#allResources"),
			addResourceId: $("#addResourceId"),
			addScheduleId: $("#addScheduleId"),

			deleteDialog: $("#deleteDialog"),
			deleteRecurringDialog: $("#deleteRecurringDialog"),

			deleteForm: $("#deleteForm"),
			deleteRecurringForm: $("#deleteRecurringForm"),
			addBlackoutForm: $("#addBlackoutForm"),

			referenceNumberList: $(":hidden.reservationId"),

			deleteMultiplePrompt: $("#delete-selected"),
			deleteMultipleDialog: $("#deleteMultipleDialog"),
			deleteMultipleForm: $("#deleteMultipleForm"),
			deleteMultipleCheckboxes: $(".delete-multiple"),
			deleteMultipleSelectAll: $("#delete-all"),
			deleteMultipleCount: $("#deleteMultipleCount"),
			deleteMultiplePlaceHolder: $("#deleteMultiplePlaceHolder"),
		};
	}

	init() {
		this.initTimePickers();
		this.handleBlackoutApplicabilityChange();
		this.bindEventListeners();
		this.configureAsyncForms();
	}

	bindEventListeners() {
		const { blackoutTable, deleteMultiplePrompt, deleteMultipleSelectAll, deleteMultipleCheckboxes } = this.elements;
		const { scopeOpts } = this.options;

		// Update buttons
		$(".btnUpdateThisInstance").click((e) => {
			e.preventDefault();
			e.stopPropagation();
			$(e.currentTarget).closest("form").find(".hdnSeriesUpdateScope").val(scopeOpts.instance);
		});

		$(".btnUpdateAllInstances").click((e) => {
			e.preventDefault();
			e.stopPropagation();
			$(e.currentTarget).closest("form").find(".hdnSeriesUpdateScope").val(scopeOpts.full);
		});


		// General buttons
		//main interface
		$(".save").click((e) => $(e.currentTarget).closest("form").submit());
		$(".cancel").click((e) => $(e.currentTarget).closest(".modal").modal("hide"));


		// Blackout table actions
		blackoutTable.on('click', '.update', (e) => {
			e.preventDefault();
			this.setActiveId($(e.currentTarget));
		});

		blackoutTable.on("click", ".edit", (e) => this.showEditBlackout($(e.currentTarget)));
		blackoutTable.on("click", ".delete", () => this.showDeleteBlackout());
		blackoutTable.on("click", ".delete-recurring", () => this.showDeleteRecurringBlackout());

		// Multiple delete actions
		deleteMultiplePrompt.click((e) => this.showDeleteMultiple());
		deleteMultipleSelectAll.click((e) => this.toggleSelectAll(e));
		deleteMultipleCheckboxes.click((e) => this.toggleDeletePrompt(e));

		// Reservation filters
		$("#showAll").click((e) => {
			e.preventDefault();
			this.resetFilters();
		});
		$("#filter").click((e) => {
			e.preventDefault();
			this.filterReservations();
		});

		//???
		$("#result").on("click", ".reload", () => location.reload());

		$("#result").on("click", ".unblock", () => {
			$("#result").hide();
			$("#wait-box").modal("hide");
		});
	}

	configureAsyncForms() {
		const { addBlackoutForm, deleteForm, deleteRecurringForm, deleteMultipleForm } = this.elements;

		ConfigureAsyncForm(addBlackoutForm, this.getSubmitCallback(this.options.actions.add), this.onAddSuccess.bind(this), null, {
			onBeforeSubmit: this.onBeforeAddSubmit.bind(this),
			target: "#result",
		});

		ConfigureAsyncForm(deleteForm, this.getSubmitCallback(this.options.actions.delete), this.onDeleteSuccess.bind(this), null, {
			onBeforeSubmit: this.onBeforeDeleteSubmit.bind(this),
			target: "#result",
		});

		ConfigureAsyncForm(deleteRecurringForm, this.getSubmitCallback(this.options.actions.delete), this.onDeleteSuccess.bind(this), null, {
			onBeforeSubmit: () => {
				this.onBeforeDeleteSubmit();
			},
			target: "#result",
		});

		ConfigureAsyncForm(deleteMultipleForm);
	}

	getSubmitCallback(action) {
		return () => `${this.options.submitUrl}?action=${action}&bid=${this.activeId}`;
	}

	setActiveId(button) {
		this.activeId = button.parents("tr").data("blackout-id");
	}

	//filter actions
	filterReservations() {
		const { startDate, endDate, scheduleId, resourceId } = this.elements;
		const filterQuery = `sd=${startDate.val()}&ed=${endDate.val()}&sid=${scheduleId.val()}&rid=${resourceId.val()}`;
		window.location = `${document.location.pathname}?${encodeURI(filterQuery)}`;
	}

	resetFilters() {
		const { startDate, endDate, scheduleId, resourceId } = this.elements;
		startDate.val("");
		endDate.val("");
		scheduleId.val("");
		resourceId.val("");
		this.filterReservations();
	}

	//edit blackout
	showEditBlackout(button) {
		this.setActiveId(button);
		const updateDiv = $("#update-contents");
		$("#update-box").modal("show");
		updateDiv.empty();
		updateDiv.load(this.getSubmitCallback(this.options.actions.edit)(), () => {
			$("#update-spinner").addClass("d-none");

			ConfigureAsyncForm(
				$("#editBlackoutForm"),
				this.getSubmitCallback(this.options.actions.update),
				this.onAddSuccess,
				null,
				{ onBeforeSubmit: this.onBeforeAddSubmit, target: "#result" }
			);

			this.initTimePickers();
			$(".save").click(() => $(this).closest('form').submit() );
		});
	}

	//multi delete actions
	toggleDeletePrompt(e) {
		e.stopPropagation();
		const numberChecked = this.elements.blackoutTable.find(".delete-multiple:checked").length;
		const allSelected = numberChecked === this.elements.blackoutTable.find(".delete-multiple").length;
		this.elements.deleteMultipleSelectAll.prop("checked", allSelected);
		this.elements.deleteMultiplePrompt.toggleClass("d-none", numberChecked === 0);
		this.elements.deleteMultiplePrompt.tooltip()
	}

	toggleSelectAll(e) {
		e.stopPropagation();
		const isChecked = this.elements.deleteMultipleSelectAll.is(":checked");
		this.elements.deleteMultipleCheckboxes.prop('checked', isChecked);
		this.elements.deleteMultiplePrompt.toggleClass('d-none', !isChecked);
	}

	showDeleteMultiple() {
		const checked = this.elements.blackoutTable.find(".delete-multiple:checked");
		this.elements.deleteMultipleCount.text(checked.length);
		this.elements.deleteMultiplePlaceHolder.empty().append(checked.clone());
		this.elements.deleteMultipleDialog.modal("show");
	}

	//single delete actions
	showDeleteBlackout() {
		this.elements.deleteDialog.modal("show");
	}

	showDeleteRecurringBlackout() {
		this.elements.deleteRecurringDialog.modal("show");
	}

	initTimePickers() {
		const { timeFormat } = this.options;
		$('.timepicker').timepicker({
			timeFormat: timeFormat
		});
	}

	handleBlackoutApplicabilityChange() {
		const { allResources, addResourceId, addScheduleId } = this.elements;

		allResources.change(function () {
			if ($(this).is(":checked")) {
				addResourceId.prop("disabled", true);
				addScheduleId.prop("disabled", false);
			} else {
				addResourceId.prop("disabled", false);
				addScheduleId.prop("disabled", true);
			}
		});
	}

	//form submission actions
	onBeforeAddSubmit(formData, jqForm, opts) {
		const isValid = BeforeFormSubmit(formData, jqForm, opts);

		if (isValid) {
			this.showWaitBox();
		}

		return isValid;
	}

	onBeforeDeleteSubmit() {
		$(".modal").modal("hide");
		this.showWaitBox();
	}

	onAddSuccess() {
		const popupUrl = this.options.popupUrl;
		$("#creatingNotification").hide();
		$("#result").show();


		$("#reservationTable").find('.editable').each((_, e) =>  {
			var refNum = $(e).data('reservation-id');
			$(e).attachReservationPopup(refNum, popupUrl);
		});

		$("#reservationTable").on('click', '.editable', (e) =>  {
			var refNum = $(e.currentTarget).data('reservation-id');
			$(e.currentTarget).addClass('clicked');
			this.viewReservation(refNum);
		});
	}

	onDeleteSuccess() {
		location.reload();
	}

	showWaitBox() {
		$("#update-box").modal("hide");
		$("#wait-box").modal("show");
		$("#result").hide();
		$("#creatingNotification").show();
	}

	viewReservation(referenceNumber) {
		window.location = this.options.reservationUrlTemplate.replace("[refnum]", referenceNumber);
	}
}

export default BlackoutManagement;