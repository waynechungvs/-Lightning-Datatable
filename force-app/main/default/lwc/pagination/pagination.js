import { LightningElement,api } from 'lwc';
export default class Pagination extends LightningElement {
    currentPage = 1
    totalRecords
    changePage = false;
    @api recordSize;
    totalPage = 0
    get records() {
        return this.visibleRecords
    }
    @api
    set records(data) {
        if (data) {
            this.totalRecords = data
            console.log(' this.totalRecords'+JSON.stringify( this.totalRecords));
            this.recordSize = Number(this.recordSize)
                        console.log('recordSize----'+this.recordSize);
                console.log('recordSize----'+typeof this.recordSize);
            this.totalPage = Math.ceil(data.length / this.recordSize)
            this.updateRecords()
        }
    }
    connectedCallback() {
        console.log('recordSizeconec----'+this.recordSize);
   
    }
    get disablePrevious() {
        return this.currentPage <= 1
    }
    get disableNext() {
        return this.currentPage >= this.totalPage
    }
    previousHandler() {
        if (this.currentPage > 1) {
            this.currentPage = this.currentPage - 1
            this.changePage = true;
            this.updateRecords()
        }
    }
    nextHandler() {
        if (this.currentPage < this.totalPage) {
            this.currentPage = this.currentPage + 1
            this.changePage = true;
            this.updateRecords()
        }
    }
    updateRecords() {
        const start = (this.currentPage - 1) * this.recordSize
        const end = this.recordSize * this.currentPage
        this.visibleRecords = this.totalRecords.slice(start, end)
        let cloneData = JSON.parse(JSON.stringify(this.visibleRecords));
            let dataWithRowIndex = cloneData.map((item, index) => {
                return { ...item, rowIndex: 'row-' + index };
            });
            this.visibleRecords = dataWithRowIndex;
        console.log('visisghjkl--'+JSON.stringify(this.visibleRecords));
        this.dispatchEvent(new CustomEvent('update', {
            detail: {
                records: this.visibleRecords,
                changePage : this.changePage
            }
        }))
        this.changePage = false;
    }
}