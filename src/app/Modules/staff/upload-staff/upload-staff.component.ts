import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../admin.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-staff',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './upload-staff.component.html',
  styleUrls: ['./upload-staff.component.css']
})
export class UploadStaffComponent implements OnInit, OnDestroy {
  staff_id: { id: string | null } = { id: localStorage.getItem('Admin_ID') };
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  message: string = '';
  existingImageUrl: string | null = null;
  intervalId: any;
  unload: any;

  constructor(private http: HttpClient, private adminService: AdminService, private route: Router) {
    this.loadExistingImage();
    this.startPolling();
  }

  ngOnInit() {
    this.loadExistingImage();
    this.startPolling();
  }

  startPolling() {
    this.intervalId = setInterval(async () => {
      const latestAdminId = localStorage.getItem('Admin_ID');
      if (latestAdminId !== this.staff_id.id) {
        this.staff_id.id = latestAdminId;
        this.loadExistingImage();
      }
    }, 300); 
  }

  loadExistingImage() {
    if (this.staff_id.id) {
      this.adminService.findstaff(this.staff_id.id).subscribe(
        (response: any) => {
          if (response.Admin_image) {
            this.existingImageUrl = `http://localhost:8000/images/${response.Admin_image}`;
            this.imagePreview = this.existingImageUrl; 
          } else {
            this.imagePreview = null; 
            this.message = 'No existing image found.'; 
          }
        },
        (error) => {
          console.error('Error loading existing image:', error);
          this.message = 'Error loading existing image. Please try again.';
        }
      );
    } else {
      this.imagePreview = null;
      this.message = 'No Admin ID found. Please log in again.';
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    this.previewImage();
  }

  previewImage() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result; 
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onUpload() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('Admin_image', this.selectedFile, this.selectedFile.name);
    
      this.http.post(`http://localhost:8000/api/update-profile-image/${this.staff_id.id}`, formData)
        .subscribe(
          (response: any) => {
            Swal.fire({
              title: 'Success!',
              text: 'Image uploaded successfully!',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              this.loadExistingImage();
              this.startPolling();
              this.route.navigate(["/main/staffpage/staffmain/staffview/"]);
            });
          },
          (error: any) => {
            Swal.fire({
              title: 'Error!',
              text: 'Error uploading image. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            console.error('Error:', error);
          }
        );
    } else {
      Swal.fire({
        title: 'Warning!',
        text: 'Please select an image first.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
    
  }

  ngOnDestroy() {
    clearInterval(this.intervalId); 
  }
}
