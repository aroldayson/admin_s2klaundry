import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { AdminService } from '../../../admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dicrepancy',
  standalone: true,
  imports: [RouterLink, NgxPrintModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dicrepancy.component.html',
  styleUrls: ['./dicrepancy.component.css']  
})
export class DicrepancyComponent implements OnInit {
  remit: any[] = [];           
  fromDate: string = '';       
  toDate: string = '';         
  filteredData: any[] = [];    

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
      this.admin.remittanceapproved().subscribe((result: any) => {
          this.remit = result;
          this.filteredData = this.remit;

          this.filteredData = this.filteredData.filter((transaction: any) => transaction.Fund_status === 'Approve');

          if (this.filteredData.length === 0) {
              console.log('No approved transactions found');
          }

          console.log('Remit Data:', this.filteredData);
      });
  }

  onDateChange() {
      if (this.fromDate && this.toDate) {
          const fromDateStart = new Date(this.fromDate);
          fromDateStart.setHours(0, 0, 0, 0);

          const toDateEnd = new Date(this.toDate);
          toDateEnd.setHours(23, 59, 59, 999);

          this.filteredData = this.remit.filter(transaction => {
              const transactionDate = new Date(transaction.remitYear, transaction.remitMonth - 1, transaction.remitDay).getTime();
              return (
                  transactionDate >= fromDateStart.getTime() &&
                  transactionDate <= toDateEnd.getTime() &&
                  transaction.Fund_status === 'Approve'
              );
          });

          console.log('Filtered Data:', this.filteredData);
      } else {
          this.filteredData = this.remit.filter(transaction => transaction.Fund_status === 'Approve');
      }
  }
}
