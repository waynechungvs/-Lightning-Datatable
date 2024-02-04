import { LightningElement, api, track } from 'lwc';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllFieldApiNameAndData from '@salesforce/apex/GenricLightningDatatableController.getAllFieldApiName';
import deleteRecord from '@salesforce/apex/GenricLightningDatatableController.deleteRecord';
import callBackendData from '@salesforce/apex/GenricLightningDatatableController.callBackend';
import Adding_records_is_not_permitted_when_pagination_is_enabled from '@salesforce/label/c.Adding_records_is_not_permitted_when_pagination_is_enabled';
import If_pagination_is_enabled_editing_records_is_not_possible	from '@salesforce/label/c.If_pagination_is_enabled_editing_records_is_not_possible';
import Kindly_choose_the_field_set_name from '@salesforce/label/c.Kindly_choose_the_field_set_name';
import Please_input_only_numerical_values_for_the_data_table_height from '@salesforce/label/c.Please_input_only_numerical_values_for_the_data_table_height';
import Provide_api_name	 from '@salesforce/label/c.provide_api_name';
import Provide_api_name_or_field_set from '@salesforce/label/c.Provide_api_name_or_field_set';
import Please_choose_the_checkbox_for_the_field_set	from '@salesforce/label/c.Please_choose_the_checkbox_for_the_field_set';
import Please_choose_either_the_field_set_presence_or_provide_the_API_names_for_the_fie from '@salesforce/label/c.Please_choose_either_the_field_set_presence_or_provide_the_API_names_for_the_fie';
import Please_input_the_number_of_records_you_wish_to_see_per_page_in_pagination from '@salesforce/label/c.Please_input_the_number_of_records_you_wish_to_see_per_page_in_pagination';
import Please_also_choose_to_display_pagination_for_the_data_table from '@salesforce/label/c.Please_also_choose_to_display_pagination_for_the_data_table';
import Are_you_sure_you_want_to_delete_this_record from '@salesforce/label/c.Are_you_sure_you_want_to_delete_this_record';
import Record_deleted_successfully from '@salesforce/label/c.Record_deleted_successfully';
import Submission_successful from '@salesforce/label/c.Submission_successful';
import No_changes_were_made from '@salesforce/label/c.No_changes_were_made';
// import NewCaseLabel from '@salesforce/label/c.NewCaseLabel';
// import NewCaseLabel from '@salesforce/label/c.NewCaseLabel';


export default class GenricLightningDatatable extends LightningElement {
    @api objectApiName;
    @api fieldSetName;
    @api isFeildSetPresent;
    @api coloumns;
    @api displayLog;
    @api lightningDataTableHeight;
    @api isDeleteRecords;
    @api isAddRecords;
    @api isEditRecords;
    @api recordShowOnDataTable;
    @api isShowPagination;
    @api headerOfDataTable;
    @api searchData;
    //trueValue = true
    isNoRecordError = false;
    @track column = [];
    isLoading = true;
    isError = false;
    errorMessage = '';
    dataTableHeight = '';
    @track fieldSetData = [];
    @track data = [];
    isDisabled = false;
    @track visibleData = [];
    @track columnAdd = [];
    @track draftValues = [];
    searchStyle = 'margin-left:1%';
    @track changedData = [];
    searchDataField = 'all';
    fieldDataForFilter = [];
    //columnDefaultValue = '';
    get showFooterButton() {
        return (this.isAddRecords || this.isEditRecords);
    }
    get columnFilterOptions() {
        // Object.keys(this.columnAdd).forEach(key => {
        //                     if (key !== 'rowIndex' && key !== 'id') {
        //                         columnOptions.push({label: key, value: obj.fieldName });
        //                         copyData[indexToUpdate][key] = update[key];
        //                     }
        //                 });
        let columnOptions = this.fieldDataForFilter.map(obj => {
            // if (obj.type != 'button-icon'){
                return { label: obj.label, value: obj.fieldName };
            // }
        });
        return [{ label: 'All', value: 'all' }, ...columnOptions];
    }
    // get columnDefaultValue(){
    //     return this.searchDataField;
    // }
    
    connectedCallback() {
        try {
            this.isError = false;
            this.errorMessage = '';
            this.dataTableHeight = '';
            this.fieldSetData = [];
            this.data = [];
            this.visibleData = [];
            this.column = [];
            this.columnAdd = [];
            this.isLoading = true;
            this.draftValues = [];
            this.fieldDataForFilter = [];
            this.validateTargetConfigData();
            if (this.isError) {
                this.isLoading = false;
            } else {
//this.searchStyle = ;
                this.dataTableHeight = 'height:' + this.lightningDataTableHeight + 'px;';
                this.getFieldsforColumn();
            }
            
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    validateTargetConfigData() {
        try {
            this.isError = false;
            this.errorMessage = '';
            if (this.isFeildSetPresent && (this.fieldSetName == '' || this.fieldSetName == null || this.fieldSetName == undefined)) {
                this.isError = true;
                this.errorMessage = Kindly_choose_the_field_set_name;
            } else if (!this.isFeildSetPresent && (this.coloumns == '' || this.coloumns == null || this.coloumns == undefined) && (this.fieldSetName == '' || this.fieldSetName == null || this.fieldSetName == undefined)) {
                this.isError = true;
                this.errorMessage = Provide_api_name;
            } else if (this.coloumns != undefined && this.fieldSetName != undefined) {
                this.isError = true;
                this.errorMessage = Provide_api_name_or_field_set;
            } else if (!this.isFeildSetPresent && this.fieldSetData != undefined) {
                this.isError = true;
                this.errorMessage = Please_choose_the_checkbox_for_the_field_set;
            } else if (this.isFeildSetPresent && this.coloumns != undefined) {
                this.isError = true;
                this.errorMessage = Please_choose_either_the_field_set_presence_or_provide_the_API_names_for_the_fie;
            } else if (isNaN(this.lightningDataTableHeight) && this.lightningDataTableHeight != undefined) {
                this.isError = true;
                this.errorMessage = Please_input_only_numerical_values_for_the_data_table_height;
            } else if (this.isShowPagination && this.isEditRecords == true) {
                this.isError = true;
                this.errorMessage = If_pagination_is_enabled_editing_records_is_not_possible;
            } else if (this.isShowPagination && this.isAddRecords == true) {
                this.isError = true;
                this.errorMessage = Adding_records_is_not_permitted_when_pagination_is_enabled;
            }
            else if (this.isShowPagination && this.recordShowOnDataTable == undefined) {
                this.isError = true;
                this.errorMessage = Please_input_the_number_of_records_you_wish_to_see_per_page_in_pagination;
            } else if (!this.isShowPagination && this.recordShowOnDataTable != undefined) {
                this.isError = true;
                this.errorMessage = Please_also_choose_to_display_pagination_for_the_data_table;
            }
            // else if (this.searchData && this.searchDataField == undefined) {
            //     this.isError = true;
            //     this.errorMessage = 'Please enter field name for search data in row.';
            // }
            // else if (!this.searchData && this.searchDataField != undefined) {
            //     this.isError = true;
            //     this.errorMessage = 'Please select search data checkbox.';
            // }
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    getFieldsforColumn() {
        try {
            getAllFieldApiNameAndData({ fieldSetName: this.fieldSetName, objectApiName: this.objectApiName }).then((result) => {
                if (result.isSuccess) {
                    this.fieldSetData = result.fieldData;
                    this.columnsCreate(result.fieldData);
                    console.log('field---' + JSON.stringify(result.fieldData));
                    this.recordUpdate(result.data);
                    this.isLoading = false;
                } else {
                    this.isError = true;
                    this.errorMessage = result.message;
                    this.isLoading = false;
                }
            }).catch((err) => {
                this.consoleMessageShow(true, err);
            });
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    columnsCreate(fields) {
        try {
            let temp = [];
            let emptyRow = {};
            fields.forEach(fieldData => {
                emptyRow[fieldData.apiName] = "";
                if (fieldData.dataType == 'REFERENCE') {
                    let replacedData = fieldData.apiName.replace('__c', '__r.Name');
                    var col = {
                        label:fieldData.label,
                        fieldName: replacedData,
                        type: fieldData.dataType,
                    };
                    // let replacedData = fieldData.apiName.replace('__c', '__r.Name');
                    // let typeAttributes = {
                    //         label: fieldData.label,
                    //         placeholder: 'Choose Type',
                    //         //valueName : replacedData,
                    //         objectApiName :  fieldData.refrenceFieldName,
                    //         value: { fieldName: fieldData.apiName }, // default value for picklist,
                    //         context: { fieldName: 'Id' },
                    //         index:{fieldName:'index'}, // binding account Id with context variable to be returned back
                    //         valueName:{fieldName:replacedData}
                    //     }
                    //     col = { label: fieldData.label, fieldName: fieldData.apiName, type: 'recordPickerColumn', editable: this.isEditRecords, typeAttributes: typeAttributes }
                    temp.push(col);
                } else {
                    let type = fieldData.dataType.toLowerCase();
                    var col;
                    if (fieldData.dataType.toLowerCase() == 'datetime') {
                        col = {
                            label: fieldData.label,
                            fieldName: fieldData.apiName,
                            type: 'date',
                            typeAttributes: {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                            },
                            editable: this.isEditRecords,
                        };
                    } else if (fieldData.dataType.toLowerCase() == 'picklist') {
                        emptyRow[fieldData.apiName + '_' + 'Options'] = fieldData.options;
                        let typeAttributes = {
                            label: fieldData.label,
                            placeholder: 'Choose Type', options: { fieldName: fieldData.apiName + '_' + 'Options' },
                            value: { fieldName: fieldData.apiName }, 
                            context: { fieldName: 'Id' } 
                        }
                        col = { label: fieldData.label, fieldName: fieldData.apiName, type: 'picklistColumn', editable: this.isEditRecords, typeAttributes: typeAttributes }
                    } else {
                        col = {
                            label: fieldData.label,
                            fieldName: fieldData.apiName,
                            type: type,
                            editable: this.isEditRecords,
                        };
                    }
                    temp.push(col);
                }
            })
            let Actions =
            {
                type: 'button-icon',
                fixedWidth: 40,
                cellAttributes: { alignment: 'left' },
                typeAttributes: {
                    iconName: 'utility:delete',
                    name: 'Delete',
                    title: 'Delete',
                    alternativeText: 'Delete',
                    disabled: false,
                    variant: 'bare'
                }
            };
            console.log('temp----->' + JSON.stringify(temp));
            this.fieldDataForFilter = JSON.parse(JSON.stringify(temp));
            this.column = temp;
            this.columnAdd.push(emptyRow);
            if (this.isDeleteRecords) {
                this.column.push(JSON.parse(JSON.stringify(Actions)));
            }
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }

    recordUpdate(data) {
        try {
            this.fieldSetData.forEach(fieldData => {
                for (let key in data) {
                    if (fieldData.dataType == 'REFERENCE' && data[key].hasOwnProperty(fieldData.apiName)) {
                        let replacedData = fieldData.apiName.replace('__c', '__r.Name');
                        let replacedData1 = fieldData.apiName.replace('__c', '__r');
                        data[key][replacedData] = data[key][replacedData1].Name;
                    }
                    if (fieldData.dataType == 'PICKLIST') {
                        let nameOption = fieldData.apiName + '_' + 'Options';
                        data[key][nameOption] = fieldData.options;
                    }
                }
            })
            let dataWithRowIndex = data.map((item, index) => {
                return { ...item, rowIndex: 'row-' + index, index: index };
            });
            this.data = dataWithRowIndex;
            this.visibleData = this.data;
            this.changedData = this.data;
            if (this.data.length == 0) {
                this.isNoRecordError = true;
                this.isDisabled = true;
                this.visibleData = false;
            }
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    handleRowAction() {
        try {
            this.isLoading = true;
            let selectId = event.detail.row.Id;
            let selectedRows = event.detail.row.rowIndex;
            switch (event.detail.action.name) {
                case 'Delete':
                    this.deleteConfirmation(selectId, selectedRows);
                    break;
            }
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }

    async deleteConfirmation(recordId, selectedRows) {
        try {
            const result = await LightningConfirm.open({
                message: Are_you_sure_you_want_to_delete_this_record,
                variant: 'header',
                label: 'Please confirm',
                theme: 'error',
            });
            if (result == true) {
                this.deleteRow(recordId, selectedRows);
            } else {
                this.isLoading = false;
            }
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    deleteRow(recordId, selectedRows) {
        try {
            if (recordId == undefined || recordId == '') {
                let filteredData = this.data.filter(item => item.rowIndex !== selectedRows);
                let dataWithRowIndex = filteredData.map((item, index) => {
                    return { ...item, rowIndex: 'row-' + index, index: index };
                });
                this.data = dataWithRowIndex;
                if (this.data.length == 0) {
                    this.isNoRecordError = true;
                    this.isDisabled = true;
                    this.visibleData = false;
                }
                this.isLoading = false;
            } else {
                deleteRecord({ recordId: recordId }).then((result) => {
                    if (result.isSuccess) {
                        this.showMessage(Record_deleted_successfully, 'Success', 'Success');
                        let filteredData = this.data.filter(item => item.Id !== recordId);
                        let dataWithRowIndex = filteredData.map((item, index) => {
                            return { ...item, rowIndex: 'row-' + index, index: index };
                        });
                        this.data = dataWithRowIndex;
                        if (this.data.length == 0) {
                            this.isNoRecordError = true;
                            this.isDisabled = true;
                            this.visibleData = false;
                        }
                    } else {
                        this.consoleMessageShow(false, result.message);
                        this.showMessage(result.message, 'error', 'error');
                    }
                    this.isLoading = false;
                }).catch((err) => {
                    this.consoleMessageShow(true, err);
                });
            }
        } catch (error) {
            this.consoleMessageShow(true, error)
        }
    }
    handleCellChange(event) {
        try {
            let updateItem = event.detail.draftValues;
            updateItem.forEach(ele => {
                this.updateDraftValues(ele);
            })
            this.updateDraftDataIntoMain();
            // if (this.isEditRecords) {
            //     let copyData = JSON.parse(JSON.stringify(this.data));
            //     this.draftValues.forEach(update => {
            //         let indexToUpdate = copyData.findIndex(item => item.rowIndex === update.id);
            //         if (indexToUpdate !== -1) {
            //             // Update fields in data with corresponding values from updateItem
            //             Object.keys(update).forEach(key => {
            //                 if (key !== 'rowIndex' && key !== 'id') {
            //                     copyData[indexToUpdate][key] = update[key];
            //                 }
            //             });
            //         }
            //         // filterData = copyData.filter(item => item.rowIndex === update.id);
            //         // filterData.forEach(currentItem => {
            //         //     let indexToUpdate = copyMainData.findIndex(item => item.index === currentItem.index);
            //         //     if (indexToUpdate !== -1) {
            //         //         // Update fields in data with corresponding values from updateItem
            //         //         Object.keys(currentItem).forEach(key => {
            //         //             if (key !== 'rowIndex') {
            //         //                 copyMainData[indexToUpdate][key] = currentItem[key];
            //         //             }
            //         //         });
            //         //     }
            //         // });
            //     });
            //     this.data = [...copyData];
            // } else {

            // }
            //this.
            // console.log('updateItem---' + JSON.stringify(updateItem));
            // let filterData = [];
            // this.draftValues.forEach(update => {
            //     let indexToUpdate = copyData.findIndex(item => item.rowIndex === update.id);
            //     if (indexToUpdate !== -1) {
            //         // Update fields in data with corresponding values from updateItem
            //         Object.keys(update).forEach(key => {
            //             copyData[indexToUpdate][key] = update[key];
            //         });
            //     }
            //     filterData = copyData.filter(item => item.rowIndex === update.id);
            // });
            // console.log('copyData------>' + JSON.stringify(copyData));
            // console.log('filterData------>' + JSON.stringify(filterData));
            // let copyMainData = JSON.parse(JSON.stringify(this.data));
            // filterData.forEach(currentItem => {
            //     let indexToUpdate = copyMainData.findIndex(item => item.index === currentItem.index);
            //     if (indexToUpdate !== -1) {
            //         // Update fields in data with corresponding values from updateItem
            //         Object.keys(currentItem).forEach(key => {
            //             copyMainData[indexToUpdate][key] = currentItem[key];
            //         });
            //     }
            // });
            // console.log('copyMainData------>' + JSON.stringify(copyMainData));

            // let indexChanged = {};
            // copyData.forEach(item => {
            //     if (item.rowIndex === updateItem[0].id) {
            //         for (let field in updateItem) {

            //             item[field] = updateItem[field];
            //         }
            //         indexChanged = item;
            //     }
            // });
            //             console.log('copyData------>'+JSON.stringify(copyData));

            // let copyMainData = JSON.parse(JSON.stringify(this.data));
            // copyMainData.forEach(currentItemData => {
            //     if (currentItemData.index === indexChanged.index) {
            //         for(let field in indexChanged){
            //             currentItemData[field] = indexChanged[field];
            //         }
            //         //return indexChanged;
            //     }
            // });
            //this.draftValues = [];
            // this.data = [...copyMainData];
            // console.log('copyMainData--' + JSON.stringify(this.data));
            //this.draftValues = [];
            //write changes back to original data
            // this.data = [...copyData];
            // console.log('data--'+JSON.stringify(this.data));
            // let draftValues = event.detail.draftValues;
            // draftValues.forEach(ele => {
            //     this.updateDraftValues(ele);
            // })
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    updateDraftValues(updateItem) {
        try {
            let draftValueChanged = false;
            let copyDraftValues = JSON.parse(JSON.stringify(this.draftValues));
            copyDraftValues.forEach(item => {
                if (item.id === updateItem.id) {
                    for (let field in updateItem) {
                        item[field] = updateItem[field];
                    }
                    draftValueChanged = true;
                }
            });

            if (draftValueChanged) {
                this.draftValues = JSON.parse(JSON.stringify(copyDraftValues))
            } else {
                this.draftValues = [...copyDraftValues, updateItem];
            }
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    handleClick() {
        try {
            if (event.target.label == 'Add Row') {
                this.onAddRows();
            }
            if (event.target.label == 'Submit') {
                this.isLoading = true;
                this.callBackend();
            }
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    callBackend() {
        try {
            let changedData = this.checkDataChanged();
            if (!changedData) {
                const newData = this.data.map(record => {
                    const { rowIndex, ...recordWithoutRowIndex } = record;
                    return recordWithoutRowIndex;
                });
                callBackendData({ data: JSON.stringify(newData), objectApiName: this.objectApiName }).then((result) => {
                    if (result.isSuccess) {
                        this.showMessage(Submission_successful, 'Success', 'Success');
                        window.location.reload();
                    } else {
                        this.isLoading = false;
                        this.consoleMessageShow(false, result.message);
                        this.showMessage(result.message, 'Error', 'Error');
                    }
                }).catch((err) => {
                    this.consoleMessageShow(false, err);
                });
            } else {
                this.isLoading = false;
                this.showMessage(No_changes_were_made, 'Error', 'Error');
            }
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    checkDataChanged() {
        try {
            let result = false;
            this.data.forEach(update => {
                let indexToUpdate = this.changedData.findIndex(item => item.index === update.index);
                if (indexToUpdate !== -1) {
                    Object.keys(update).forEach(key => {
                        if (this.changedData[indexToUpdate][key] != update[key]) {
                            result = true;
                        }

                    });

                }
            });
            if (result) {
                return false;
            }
            return true;
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    onAddRows() {
        try {
            this.isDisabled = false;
            this.isNoRecordError = false;
            this.visibleData = true;
            let key = this.columnAdd[0];
            this.data = [...this.data, key];
            let dataWithRowIndex = this.data.map((item, index) => {
                return { ...item, rowIndex: 'row-' + index, index: index };
            });
            this.data = dataWithRowIndex;
            this.visibleData = JSON.parse(JSON.stringify(this.data));
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    updateAccountHandler(event) {
        try {
            if (event.detail.changePage) {
                this.draftValues = [];
                this.data = JSON.parse(JSON.stringify(this.changedData));
            }

            this.visibleData = JSON.parse(JSON.stringify(event.detail.records))
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    updateDraftDataIntoMain() {
        try {
            let copyMainData = JSON.parse(JSON.stringify(this.data));
            let copyData = JSON.parse(JSON.stringify(this.visibleData));
            let filterData = [];
            this.draftValues.forEach(update => {
                let indexToUpdate = copyData.findIndex(item => item.rowIndex === update.id);
                if (indexToUpdate !== -1) {
                    Object.keys(update).forEach(key => {
                        if (key !== 'rowIndex' && key !== 'id') {
                            copyData[indexToUpdate][key] = update[key];
                        }
                    });
                }
                filterData = copyData.filter(item => item.rowIndex === update.id);
                filterData.forEach(currentItem => {
                    let indexToUpdate = copyMainData.findIndex(item => item.index === currentItem.index);
                    if (indexToUpdate !== -1) {
                        Object.keys(currentItem).forEach(key => {
                            if (key !== 'rowIndex' && key !== 'id') {
                                copyMainData[indexToUpdate][key] = currentItem[key];
                            }
                        });
                    }
                });
            });
            this.data = JSON.parse(JSON.stringify(copyMainData));
            this.visibleData = JSON.parse(JSON.stringify(copyData));
            this.draftValues = [];
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    handleFilterByColumn(){
        try{
            let input = this.template.querySelector('[data-search-input]');
            let searchItem = input ? input.value.trim().replace(/\*/g, '').toLowerCase() : '';
            this.searchDataField = event.target.value;
            if(searchItem.length){
                this.handleChange(searchItem,true)
            }
        }catch(error){
            this.consoleMessageShow(true,error);
        }
    }
    handleChange(event,value) {
        let searchValue = value ? event : event.target.value.toLowerCase();
        this.isNoRecordError = false;
        this.visibleData = this.data;
        this.dataTableHeight = 'height:' + this.lightningDataTableHeight + 'px;';
        let filteredData = [];
        if(this.searchDataField == 'all'){
            filteredData = this.visibleData.filter(o => Object.keys(o).some(k => o[k] && k!='rowIndex' && k!='index' && String(o[k]).toLowerCase().startsWith(searchValue)));
        }else{
            filteredData = this.visibleData.filter(result => result[this.searchDataField] && String(result[this.searchDataField]).toLowerCase().startsWith(searchValue));
        }
        //let filteredData = this.visibleData.filter(record => record[this.searchDataField].toLowerCase().startsWith(searchValue.toLowerCase()));
        console.log('fiilterghj'+JSON.stringify(filteredData)); 
        if (filteredData.length != 0) {

            let cloneData = JSON.parse(JSON.stringify(filteredData));
            let dataWithRowIndex = cloneData.map((item, index) => {
                return { ...item, rowIndex: 'row-' + index };
            });
            this.visibleData = dataWithRowIndex;
            if (this.isShowPagination && event.target.value == '') {
                this.isNoRecordError = false;
                let data = this.data.slice(0, Number(this.recordShowOnDataTable));
                let dataWithRowIndex = data.map((item, index) => {
                    return { ...item, rowIndex: 'row-' + index };
                });
                this.visibleData = dataWithRowIndex
            }
            if(!this.isShowPagination && event.target.value == ''){
                let data = JSON.parse(JSON.stringify(this.data));
                let dataWithRowIndex = data.map((item, index) => {
                    return { ...item, rowIndex: 'row-' + index };
                });
                this.visibleData = dataWithRowIndex
            }
        } else {
            this.visibleData = [];
            this.isNoRecordError = true;
            this.dataTableHeight = '';
        }

    }
    showMessage(message, variant, title) {
        try {
            const event = new ShowToastEvent({
                title: title,
                variant: variant,
                mode: 'dismissable',
                message: message
            });
            this.dispatchEvent(event);
        } catch (error) {
            this.consoleMessageShow(true, error);
        }
    }
    consoleMessageShow(isError, message) {
        try {
            if (isError && this.displayLog) {
                console.error(message);
            }
            if (this.displayLog && !isError) {
                console.log(message);
            }
        } catch (error) {
            if (this.displayLog) {
                console.error(error);
            }
        }
    }
}